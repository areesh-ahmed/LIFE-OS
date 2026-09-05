import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../db'
import { requireAuth } from '../../middleware/auth.middleware'
import { Priority, TaskStatus } from '@prisma/client'

export const taskRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth)

  // GET /api/tasks
  app.get('/', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const querySchema = z.object({
      filter: z.enum(['today', 'upcoming', 'completed', 'all']).optional().default('all'),
    })
    
    const parsedQuery = querySchema.safeParse(request.query)
    if (!parsedQuery.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: parsedQuery.error.message } })
    }

    const { filter } = parsedQuery.data
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)

    let whereClause: any = { userId }

    if (filter === 'completed') {
      whereClause.status = TaskStatus.COMPLETED
    } else if (filter === 'today') {
      whereClause.status = { not: TaskStatus.COMPLETED }
      whereClause.OR = [
        { dueDate: null },
        { dueDate: { lt: todayEnd } },
      ]
    } else if (filter === 'upcoming') {
      whereClause.status = { not: TaskStatus.COMPLETED }
      whereClause.dueDate = { gte: todayEnd }
    } else if (filter === 'all') {
      whereClause.status = { not: TaskStatus.COMPLETED }
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    })

    return tasks
  })

  // POST /api/tasks
  app.post('/', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    
    const bodySchema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      dueDate: z.string().datetime().optional().nullable(),
      category: z.string(),
      priority: z.nativeEnum(Priority),
    })

    const parsed = bodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } })
    }

    const task = await prisma.task.create({
      data: {
        ...parsed.data,
        userId,
      },
    })

    return reply.status(201).send(task)
  })

  // GET /api/tasks/:id
  app.get('/:id', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const { id } = request.params as { id: string }

    const task = await prisma.task.findUnique({
      where: { id },
    })

    if (!task || task.userId !== userId) {
      return reply.status(404).send({ error: { code: 'TASK_NOT_FOUND', message: 'Task not found' } })
    }

    return task
  })

  // PATCH /api/tasks/:id
  app.patch('/:id', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const { id } = request.params as { id: string }

    const bodySchema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      dueDate: z.string().datetime().optional().nullable(),
      category: z.string().optional(),
      priority: z.nativeEnum(Priority).optional(),
      status: z.nativeEnum(TaskStatus).optional(),
    })

    const parsed = bodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } })
    }

    const existingTask = await prisma.task.findUnique({ where: { id } })
    if (!existingTask || existingTask.userId !== userId) {
      return reply.status(404).send({ error: { code: 'TASK_NOT_FOUND', message: 'Task not found' } })
    }

    const updates = { ...parsed.data } as any
    
    // Handle completion state change
    if (updates.status === TaskStatus.COMPLETED && existingTask.status !== TaskStatus.COMPLETED) {
      updates.completedAt = new Date()
      // Log activity
      await prisma.activityLog.create({
        data: {
          userId,
          type: 'TASK_COMPLETED',
          description: `Completed task: ${existingTask.title || updates.title}`,
          metadata: { taskId: id },
        },
      })
    } else if (updates.status && updates.status !== TaskStatus.COMPLETED && existingTask.status === TaskStatus.COMPLETED) {
      updates.completedAt = null
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updates,
    })

    return updatedTask
  })

  // DELETE /api/tasks/:id
  app.delete('/:id', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const { id } = request.params as { id: string }

    const task = await prisma.task.findUnique({ where: { id } })
    if (!task || task.userId !== userId) {
      return reply.status(404).send({ error: { code: 'TASK_NOT_FOUND', message: 'Task not found' } })
    }

    await prisma.task.delete({ where: { id } })
    return reply.status(204).send()
  })
}
