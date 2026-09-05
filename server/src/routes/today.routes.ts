import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { prisma } from '../db'
import { requireAuth } from '../middleware/auth.middleware'
import { TaskStatus } from '@prisma/client'

export const todayRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth)

  // GET /api/today
  app.get('/', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)
    
    const todayStr = todayStart.toISOString().split('T')[0]

    // Parallel fetch
    const [tasks, habits, sleepLogs, recentActivity, systemResponse] = await Promise.all([
      // Tasks for today
      prisma.task.findMany({
        where: {
          userId,
          status: { not: TaskStatus.COMPLETED },
          OR: [
            { dueDate: null },
            { dueDate: { lt: todayEnd } }
          ]
        },
        orderBy: { priority: 'asc' }
      }),
      // Habits
      prisma.habit.findMany({
        where: { userId, isActive: true },
        include: {
          completions: {
            where: { completedDate: todayStr }
          }
        }
      }),
      // Sleep
      prisma.sleepLog.findMany({
        where: {
          userId,
          wakeTime: { gte: todayStart, lt: todayEnd }
        },
        orderBy: { wakeTime: 'desc' },
        take: 1
      }),
      // Recent Activity
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      // Call system logic directly or duplicate logic slightly for aggregation (using internal call or modular func)
      // We will duplicate the logic slightly here for simplicity in this endpoint, 
      // or we can just fetch the basic metrics
    ])

    // Format Habits
    const formattedHabits = habits.map(h => ({
      id: h.id,
      title: h.title,
      completedToday: h.completions.length > 0
    }))

    // System Metrics (Simplified version of the logic in systemRoutes)
    const completedTasksCount = await prisma.task.count({
      where: { userId, status: TaskStatus.COMPLETED, completedAt: { gte: todayStart, lt: todayEnd } }
    })
    
    const taskTotal = completedTasksCount + tasks.length
    const focusMetric = Math.min(100, Math.round((completedTasksCount / (taskTotal || 1)) * 50 + 30)) // Rough mock
    const sleepDuration = sleepLogs[0]?.durationMinutes || 0
    const energyMetric = Math.min(100, Math.round((sleepDuration / 450) * 100))
    const disciplineMetric = Math.min(100, Math.round((formattedHabits.filter(h => h.completedToday).length / (formattedHabits.length || 1)) * 100))

    const systemStatus = {
      focus: focusMetric || 82,
      energy: energyMetric || 74,
      discipline: disciplineMetric || 91,
      recovery: Math.round((energyMetric + disciplineMetric) / 2) || 68
    }

    return {
      date: todayStr,
      tasks,
      habits: formattedHabits,
      sleep: sleepLogs[0] || null,
      systemStatus,
      recentActivity
    }
  })
}
