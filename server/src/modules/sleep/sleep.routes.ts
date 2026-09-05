import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../db'
import { requireAuth } from '../../middleware/auth.middleware'
import { SleepStatus } from '@prisma/client'

export const sleepRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth)

  // GET /api/sleep
  app.get('/', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    
    const querySchema = z.object({
      filter: z.enum(['today', 'week', 'month']).optional().default('week'),
    })
    
    const parsedQuery = querySchema.safeParse(request.query)
    if (!parsedQuery.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: parsedQuery.error.message } })
    }

    const { filter } = parsedQuery.data
    const now = new Date()
    let startDate = new Date()

    if (filter === 'today') {
      startDate.setHours(0, 0, 0, 0)
    } else if (filter === 'week') {
      startDate.setDate(startDate.getDate() - 7)
    } else if (filter === 'month') {
      startDate.setMonth(startDate.getMonth() - 1)
    }

    const logs = await prisma.sleepLog.findMany({
      where: { 
        userId,
        wakeTime: { gte: startDate }
      },
      orderBy: { wakeTime: 'desc' },
    })

    return logs
  })

  // POST /api/sleep
  app.post('/', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    
    const bodySchema = z.object({
      sleepStart: z.string().datetime(),
      wakeTime: z.string().datetime(),
      targetMinutes: z.number().min(0).default(450), // 7.5 hours
      status: z.nativeEnum(SleepStatus),
    })

    const parsed = bodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } })
    }

    const { sleepStart, wakeTime, targetMinutes, status } = parsed.data
    const start = new Date(sleepStart)
    const end = new Date(wakeTime)
    
    const durationMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))

    const log = await prisma.sleepLog.create({
      data: {
        userId,
        sleepStart: start,
        wakeTime: end,
        durationMinutes,
        targetMinutes,
        status,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        type: 'SLEEP_RECORDED',
        description: `Recorded sleep: ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`,
        metadata: { sleepLogId: log.id },
      },
    })

    return reply.status(201).send(log)
  })

  // GET /api/sleep/:id
  app.get('/:id', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const { id } = request.params as { id: string }

    const log = await prisma.sleepLog.findUnique({ where: { id } })
    if (!log || log.userId !== userId) {
      return reply.status(404).send({ error: { code: 'LOG_NOT_FOUND', message: 'Sleep log not found' } })
    }

    return log
  })

  // PATCH /api/sleep/:id
  app.patch('/:id', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const { id } = request.params as { id: string }

    const bodySchema = z.object({
      sleepStart: z.string().datetime().optional(),
      wakeTime: z.string().datetime().optional(),
      targetMinutes: z.number().min(0).optional(),
      status: z.nativeEnum(SleepStatus).optional(),
    })

    const parsed = bodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } })
    }

    const log = await prisma.sleepLog.findUnique({ where: { id } })
    if (!log || log.userId !== userId) {
      return reply.status(404).send({ error: { code: 'LOG_NOT_FOUND', message: 'Sleep log not found' } })
    }

    const updates = { ...parsed.data } as any
    if (updates.sleepStart || updates.wakeTime) {
      const start = updates.sleepStart ? new Date(updates.sleepStart) : log.sleepStart
      const end = updates.wakeTime ? new Date(updates.wakeTime) : log.wakeTime
      updates.durationMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
    }

    const updatedLog = await prisma.sleepLog.update({
      where: { id },
      data: updates,
    })

    return updatedLog
  })

  // DELETE /api/sleep/:id
  app.delete('/:id', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const { id } = request.params as { id: string }

    const log = await prisma.sleepLog.findUnique({ where: { id } })
    if (!log || log.userId !== userId) {
      return reply.status(404).send({ error: { code: 'LOG_NOT_FOUND', message: 'Sleep log not found' } })
    }

    await prisma.sleepLog.delete({ where: { id } })
    return reply.status(204).send()
  })
}
