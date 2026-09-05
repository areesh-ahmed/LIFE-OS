import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { prisma } from '../../db'
import { requireAuth } from '../../middleware/auth.middleware'
import { TaskStatus, FocusStatus } from '@prisma/client'

export const systemRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preHandler', requireAuth)

  // GET /api/system/today
  app.get('/today', async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)
    
    const todayStr = todayStart.toISOString().split('T')[0]

    // 1. Task metrics
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        OR: [
          { dueDate: null },
          { dueDate: { lt: todayEnd } },
          { status: TaskStatus.COMPLETED, completedAt: { gte: todayStart, lt: todayEnd } }
        ]
      }
    })
    
    const taskMetrics = {
      completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
      total: tasks.length
    }

    // 2. Habit metrics
    const habits = await prisma.habit.findMany({
      where: { userId, isActive: true },
      include: {
        completions: {
          where: { completedDate: todayStr }
        }
      }
    })
    
    const habitMetrics = {
      completed: habits.filter(h => h.completions.length > 0).length,
      total: habits.length
    }

    // 3. Focus metrics
    const focusSessions = await prisma.focusSession.findMany({
      where: {
        userId,
        status: FocusStatus.COMPLETED,
        startedAt: { gte: todayStart, lt: todayEnd }
      }
    })
    
    const focusSeconds = focusSessions.reduce((acc, curr) => acc + curr.durationSeconds, 0)

    // 4. Sleep metrics
    const sleepLogs = await prisma.sleepLog.findMany({
      where: {
        userId,
        wakeTime: { gte: todayStart, lt: todayEnd }
      }
    })
    
    const sleepDurationMinutes = sleepLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0)

    // Calculate arbitrary overall system metrics for the UI (0-100)
    // E.g. Focus based on tasks + focus seconds
    const focusMetric = Math.min(100, Math.round(((taskMetrics.completed / (taskMetrics.total || 1)) * 50) + (focusSeconds / 7200) * 50))
    // Energy based on sleep
    const energyMetric = Math.min(100, Math.round((sleepDurationMinutes / 450) * 100))
    // Discipline based on habits
    const disciplineMetric = Math.min(100, Math.round((habitMetrics.completed / (habitMetrics.total || 1)) * 100))
    
    const recoveryMetric = Math.min(100, Math.round((energyMetric + disciplineMetric) / 2))

    return {
      focus: focusMetric,
      energy: energyMetric,
      discipline: disciplineMetric,
      recovery: recoveryMetric,
    }
  })
}
