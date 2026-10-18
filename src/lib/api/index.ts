import { fetchApi } from './client'
import { Task, Habit, SleepLog, SystemMetrics } from '../types'

export const authApi = {
  getMe: () => fetchApi<{ user: { id: string; name: string; email: string; avatarUrl: string } }>('/auth/me'),
  logout: () => fetchApi<{ success: boolean }>('/auth/logout', { method: 'POST' }),
}

export const todayApi = {
  getToday: () => fetchApi<{
    date: string
    tasks: Task[]
    habits: (Habit & { completedToday: boolean })[]
    sleep: SleepLog | null
    systemStatus: SystemMetrics
    recentActivity: unknown[]
  }>('/today'),
}

export const tasksApi = {
  getAll: (filter: string = 'all') => fetchApi<Task[]>(`/tasks?filter=${filter}`),
  create: (data: Partial<Task>) => fetchApi<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Task>) => fetchApi<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<void>(`/tasks/${id}`, { method: 'DELETE' }),
}

export const habitsApi = {
  getAll: () => fetchApi<Habit[]>('/habits'),
  create: (data: Partial<Habit>) => fetchApi<Habit>('/habits', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Habit>) => fetchApi<Habit>(`/habits/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<void>(`/habits/${id}`, { method: 'DELETE' }),
  complete: (id: string, date?: string) => fetchApi<void>(`/habits/${id}/complete`, { 
    method: 'POST', 
    body: JSON.stringify(date ? { date } : {}) 
  }),
  uncomplete: (id: string, date: string) => fetchApi<void>(`/habits/${id}/complete/${date}`, { method: 'DELETE' }),
}

// Re-export client base
export { fetchApi }
