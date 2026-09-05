export type Task = {
  id: string;
  title: string;
  time?: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  completed: boolean;
};

export type Habit = {
  id: string;
  title: string;
  frequency: string;
  completedToday: boolean;
  streak: number;
  weeklyTarget: number;
  weeklyCompleted: number;
};

export type SleepLog = {
  start: string;
  wake: string;
  total: string;
  target: string;
  status: 'GOOD' | 'FAIR' | 'POOR';
};

export type SystemMetrics = {
  focus: number;
  energy: number;
  discipline: number;
  recovery: number;
};

export const initialTasks: Task[] = [
  { id: '1', title: 'Study Java', time: '09:00', category: 'STUDY', priority: 'HIGH', completed: false },
  { id: '2', title: 'Complete assignment', time: '11:30', category: 'STUDY', priority: 'HIGH', completed: false },
  { id: '3', title: 'Project work', time: '15:00', category: 'WORK', priority: 'MEDIUM', completed: false },
  { id: '4', title: 'Workout', time: '17:30', category: 'HEALTH', priority: 'HIGH', completed: false },
  { id: '5', title: 'Read 20 pages', time: '21:00', category: 'GROWTH', priority: 'LOW', completed: false },
];

export const initialHabits: Habit[] = [
  { id: '1', title: 'Wake up on time', frequency: 'Daily', completedToday: true, streak: 12, weeklyTarget: 7, weeklyCompleted: 6 },
  { id: '2', title: 'Drink water', frequency: 'Daily', completedToday: true, streak: 5, weeklyTarget: 7, weeklyCompleted: 5 },
  { id: '3', title: 'Meditation', frequency: 'Daily', completedToday: false, streak: 0, weeklyTarget: 7, weeklyCompleted: 3 },
  { id: '4', title: 'Reading', frequency: 'Daily', completedToday: true, streak: 12, weeklyTarget: 7, weeklyCompleted: 6 },
  { id: '5', title: 'Exercise', frequency: '4x/week', completedToday: false, streak: 2, weeklyTarget: 4, weeklyCompleted: 2 },
];

export const mockSleep: SleepLog = {
  start: '23:47',
  wake: '07:18',
  total: '7h 31m',
  target: '7h 30m',
  status: 'GOOD',
};

export const mockMetrics: SystemMetrics = {
  focus: 82,
  energy: 74,
  discipline: 91,
  recovery: 68,
};
