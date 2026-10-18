export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskCategory = 'STUDY' | 'WORK' | 'HEALTH' | 'GROWTH' | 'SYSTEM' | string;

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  category: TaskCategory;
  priority: Priority;
  completed: boolean;
  completedAt?: string; // ISO string
}

export interface Habit {
  id: string;
  title: string;
  frequency: string; // e.g., 'Daily', '5x/week', '4x/week', '3x/week'
  weeklyTarget: number;
  completedDates: string[]; // List of YYYY-MM-DD dates when completed
  // Backward-compatible fields
  completedToday?: boolean;
  streak?: number;
  weeklyCompleted?: number;
}

export type SleepQuality = 'GOOD' | 'FAIR' | 'POOR';

export interface SleepEntry {
  id: string;
  date: string; // YYYY-MM-DD (the night/morning recorded)
  start: string; // HH:MM (bedtime)
  wake: string; // HH:MM (wakeup)
  durationMinutes: number;
  durationFormatted: string; // e.g. "7h 45m"
  targetFormatted: string; // e.g. "8h 00m"
  status: SleepQuality;
  notes?: string;
}

// Backward-compatible SleepLog type
export interface SleepLog {
  start: string;
  wake: string;
  total: string;
  target: string;
  status: SleepQuality;
}

export interface WeeklyItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt?: string;
}

export interface FocusSession {
  id: string;
  projectName: string;
  durationSeconds: number;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
}

export interface ActivityEntry {
  time: string; // HH:MM
  text: string;
  status: string; // '✓' | '•' | '+' | '⚡' | '>' | '×'
  timestamp?: string; // ISO
}

export interface ActivityDayLog {
  date: string; // 'TODAY', 'YESTERDAY', or YYYY-MM-DD
  entries: ActivityEntry[];
}

export interface SystemMetrics {
  focus: number;
  energy: number;
  discipline: number;
  recovery: number;
  isRated?: boolean;
}

export interface LifeOSState {
  version: number;
  tasks: Task[];
  habits: Habit[];
  weeklyChecklist: WeeklyItem[];
  sleepRecords: SleepEntry[];
  // Backward compatibility alias for single latest sleep
  sleep: SleepLog | null;
  focusSessions: FocusSession[];
  focusSecondsToday: number;
  focusSessionsCount: number;
  activityLogs: ActivityDayLog[];
  lastActiveDate: string; // YYYY-MM-DD
}
