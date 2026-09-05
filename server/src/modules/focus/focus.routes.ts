import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../db'
import { requireAuth } from '../../middleware/auth.middleware'
import { FocusStatus } from '@prisma/client'

export const focusRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth)

  // GET /api/focus
  app.get('/', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    
    const sessions = await prisma.focusSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        task: { select: { title: true } }
      }
    })

    return sessions
  })

  // POST /api/focus (start session)
  app.post('/', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    
    const bodySchema = z.object({
      taskId: z.string().optional().nullable(),
      projectName: z.string().optional().nullable(),
    })

    const parsed = bodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } })
    }

    const session = await prisma.focusSession.create({
      data: {
        ...parsed.data,
        userId,
        startedAt: new Date(),
        durationSeconds: 0,
        status: FocusStatus.IN_PROGRESS,
      },
    })

    return reply.status(201).send(session)
  })

  // POST /api/focus/:id/finish
  app.post('/:id/finish', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const { id } = request.params as { id: string }

    const session = await prisma.focusSession.findUnique({ 
      where: { id },
      include: { task: true }
    })
    
    if (!session || session.userId !== userId) {
      return reply.status(404).send({ error: { code: 'SESSION_NOT_FOUND', message: 'Focus session not found' } })
    }

    if (session.status !== FocusStatus.IN_PROGRESS) {
      return reply.status(400).send({ error: { code: 'INVALID_STATE', message: 'Session is not in progress' } })
    }

    const endedAt = new Date()
    const durationSeconds = Math.round((endedAt.getTime() - session.startedAt.getTime()) / 1000)

    const updatedSession = await prisma.focusSession.update({
      where: { id },
      data: {
        endedAt,
        durationSeconds,
        status: FocusStatus.COMPLETED,
      },
    })

    // Log activity
    const label = session.projectName || session.task?.title || 'Focus Session'
    await prisma.activityLog.create({
      data: {
        userId,
        type: 'FOCUS_SESSION_COMPLETED',
        description: `Completed focus: ${label}`,
        metadata: { sessionId: id, durationSeconds },
      },
    })

    return updatedSession
  })
}
