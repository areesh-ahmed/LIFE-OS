import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../db'
import { requireAuth } from '../../middleware/auth.middleware'

export const weeklyRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth)

  // GET /api/weekly
  app.get('/', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    
    // Default to current week start (Monday)
    let d = new Date()
    let day = d.getDay()
    let diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    let weekStart = new Date(d.setDate(diff))
    let weekStartStr = weekStart.toISOString().split('T')[0]

    const querySchema = z.object({
      weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().default(weekStartStr),
    })
    
    const parsedQuery = querySchema.safeParse(request.query)
    if (!parsedQuery.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: parsedQuery.error.message } })
    }

    const goals = await prisma.weeklyGoal.findMany({
      where: { 
        userId,
        weekStart: parsedQuery.data.weekStart
      },
      orderBy: { createdAt: 'asc' },
    })

    return goals
  })

  // POST /api/weekly
  app.post('/', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    
    const bodySchema = z.object({
      title: z.string().min(1),
      weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })

    const parsed = bodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } })
    }

    const goal = await prisma.weeklyGoal.create({
      data: {
        ...parsed.data,
        userId,
      },
    })

    return reply.status(201).send(goal)
  })

  // PATCH /api/weekly/:id
  app.patch('/:id', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const { id } = request.params as { id: string }

    const bodySchema = z.object({
      title: z.string().min(1).optional(),
      completed: z.boolean().optional(),
    })

    const parsed = bodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } })
    }

    const goal = await prisma.weeklyGoal.findUnique({ where: { id } })
    if (!goal || goal.userId !== userId) {
      return reply.status(404).send({ error: { code: 'GOAL_NOT_FOUND', message: 'Goal not found' } })
    }

    const updates = { ...parsed.data } as any
    if (updates.completed === true && !goal.completed) {
      updates.completedAt = new Date()
      await prisma.activityLog.create({
        data: {
          userId,
          type: 'WEEKLY_GOAL_COMPLETED',
          description: `Completed weekly goal: ${goal.title}`,
          metadata: { goalId: id },
        },
      })
    } else if (updates.completed === false) {
      updates.completedAt = null
    }

    const updatedGoal = await prisma.weeklyGoal.update({
      where: { id },
      data: updates,
    })

    return updatedGoal
  })

  // DELETE /api/weekly/:id
  app.delete('/:id', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const { id } = request.params as { id: string }

    const goal = await prisma.weeklyGoal.findUnique({ where: { id } })
    if (!goal || goal.userId !== userId) {
      return reply.status(404).send({ error: { code: 'GOAL_NOT_FOUND', message: 'Goal not found' } })
    }

    await prisma.weeklyGoal.delete({ where: { id } })
    return reply.status(204).send()
  })
}
