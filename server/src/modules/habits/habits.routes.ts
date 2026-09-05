import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../db'
import { requireAuth } from '../../middleware/auth.middleware'

export const habitRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth)

  // GET /api/habits
  app.get('/', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    
    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        completions: {
          orderBy: { completedDate: 'desc' },
          take: 30, // Get last 30 days of completions for stats
        },
      },
    })

    // Calculate dynamic stats
    const today = new Date().toISOString().split('T')[0]
    
    const enrichedHabits = habits.map(habit => {
      const completedToday = habit.completions.some(c => c.completedDate === today)
      
      // Calculate current streak
      let streak = 0
      let d = new Date()
      // If not completed today, start checking from yesterday
      if (!completedToday) {
        d.setDate(d.getDate() - 1)
      }
      
      while (true) {
        const dateStr = d.toISOString().split('T')[0]
        if (habit.completions.some(c => c.completedDate === dateStr)) {
          streak++
          d.setDate(d.getDate() - 1)
        } else {
          break
        }
      }

      // Calculate weekly completion
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // rough Sunday start
      const weekStartStr = weekStart.toISOString().split('T')[0]
      const weeklyCompleted = habit.completions.filter(c => c.completedDate >= weekStartStr).length

      return {
        id: habit.id,
        title: habit.title,
        description: habit.description,
        frequency: habit.frequency,
        targetPerWeek: habit.targetPerWeek,
        isActive: habit.isActive,
        completedToday,
        streak,
        weeklyCompleted,
        weeklyTarget: habit.targetPerWeek,
      }
    })

    return enrichedHabits
  })

  // POST /api/habits
  app.post('/', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    
    const bodySchema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      frequency: z.string(),
      targetPerWeek: z.number().min(1).max(7),
    })

    const parsed = bodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } })
    }

    const habit = await prisma.habit.create({
      data: {
        ...parsed.data,
        userId,
      },
    })

    return reply.status(201).send(habit)
  })

  // GET /api/habits/:id
  app.get('/:id', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const { id } = request.params as { id: string }

    const habit = await prisma.habit.findUnique({
      where: { id },
      include: { completions: true }
    })

    if (!habit || habit.userId !== userId) {
      return reply.status(404).send({ error: { code: 'HABIT_NOT_FOUND', message: 'Habit not found' } })
    }

    return habit
  })

  // PATCH /api/habits/:id
  app.patch('/:id', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const { id } = request.params as { id: string }

    const bodySchema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      frequency: z.string().optional(),
      targetPerWeek: z.number().min(1).max(7).optional(),
      isActive: z.boolean().optional(),
    })

    const parsed = bodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } })
    }

    const habit = await prisma.habit.findUnique({ where: { id } })
    if (!habit || habit.userId !== userId) {
      return reply.status(404).send({ error: { code: 'HABIT_NOT_FOUND', message: 'Habit not found' } })
    }

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: parsed.data,
    })

    return updatedHabit
  })

  // DELETE /api/habits/:id
  app.delete('/:id', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const { id } = request.params as { id: string }

    const habit = await prisma.habit.findUnique({ where: { id } })
    if (!habit || habit.userId !== userId) {
      return reply.status(404).send({ error: { code: 'HABIT_NOT_FOUND', message: 'Habit not found' } })
    }

    await prisma.habit.delete({ where: { id } })
    return reply.status(204).send()
  })

  // POST /api/habits/:id/complete
  app.post('/:id/complete', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const { id } = request.params as { id: string }

    const bodySchema = z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
    })

    const parsed = bodySchema.safeParse(request.body || {})
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } })
    }

    const habit = await prisma.habit.findUnique({ where: { id } })
    if (!habit || habit.userId !== userId) {
      return reply.status(404).send({ error: { code: 'HABIT_NOT_FOUND', message: 'Habit not found' } })
    }

    const completedDate = parsed.data.date || new Date().toISOString().split('T')[0]

    try {
      const completion = await prisma.habitCompletion.create({
        data: {
          habitId: id,
          userId,
          completedDate,
        },
      })
      
      // Log activity
      await prisma.activityLog.create({
        data: {
          userId,
          type: 'HABIT_COMPLETED',
          description: `Completed habit: ${habit.title}`,
          metadata: { habitId: id, date: completedDate },
        },
      })

      return reply.status(201).send(completion)
    } catch (e: any) {
      if (e.code === 'P2002') {
        return reply.status(409).send({ error: { code: 'ALREADY_COMPLETED', message: 'Habit already completed for this date' } })
      }
      throw e
    }
  })

  // DELETE /api/habits/:id/complete/:date
  app.delete('/:id/complete/:date', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const { id, date } = request.params as { id: string, date: string }

    const habit = await prisma.habit.findUnique({ where: { id } })
    if (!habit || habit.userId !== userId) {
      return reply.status(404).send({ error: { code: 'HABIT_NOT_FOUND', message: 'Habit not found' } })
    }

    await prisma.habitCompletion.deleteMany({
      where: {
        habitId: id,
        completedDate: date,
      }
    })

    return reply.status(204).send()
  })
}
