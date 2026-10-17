import { Task, Habit, SleepLog, SystemMetrics, initialTasks, initialHabits, mockSleep } from './mockData';

export interface WeeklyItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface ActivityEntry {
  time: string;
  text: string;
  status: string;
}

export interface ActivityDayLog {
  date: string;
  entries: ActivityEntry[];
}

export interface LifeOSState {
  tasks: Task[];
  habits: Habit[];
  weeklyChecklist: WeeklyItem[];
  sleep: SleepLog;
  focusSecondsToday: number;
  focusSessionsCount: number;
  activityLogs: ActivityDayLog[];
}

const STORAGE_KEY = 'life_os_local_data_v1';
const EVENT_NAME = 'life_os_state_update';

const initialWeeklyChecklist: WeeklyItem[] = [
  { id: '1', title: 'Finish Java assignment', completed: true },
  { id: '2', title: 'Workout 4 times', completed: false },
  { id: '3', title: 'Read 100 pages', completed: true },
  { id: '4', title: 'Complete project milestone', completed: false },
  { id: '5', title: 'Sleep before 12 AM', completed: true },
];

const initialActivityLogs: ActivityDayLog[] = [
  {
    date: 'TODAY',
    entries: [
      { time: '08:30', text: 'System boot sequence initiated', status: '✓' },
      { time: '09:00', text: 'Java — Binary Search practice', status: '✓' },
      { time: '11:15', text: 'Hydration target: 1L completed', status: '✓' },
      { time: '12:00', text: 'Focus Sprint #1 concluded', status: '✓' },
    ],
  },
  {
    date: 'YESTERDAY',
    entries: [
      { time: '09:14', text: 'Data structures review', status: '✓' },
      { time: '17:20', text: 'Gym session: Strength routine', status: '✓' },
      { time: '23:45', text: 'Sleep protocol initiated', status: '✓' },
    ],
  },
];

export const defaultState: LifeOSState = {
  tasks: initialTasks,
  habits: initialHabits,
  weeklyChecklist: initialWeeklyChecklist,
  sleep: mockSleep,
  focusSecondsToday: 7320, // 2h 02m
  focusSessionsCount: 3,
  activityLogs: initialActivityLogs,
};

export function getStoredState(): LifeOSState {
  if (typeof window === 'undefined') {
    return defaultState;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
      return defaultState;
    }
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
    };
  } catch (err) {
    console.warn('Failed to parse Life OS storage, using defaults:', err);
    return defaultState;
  }
}

export function saveState(nextState: LifeOSState | ((prev: LifeOSState) => LifeOSState)) {
  if (typeof window === 'undefined') return;
  try {
    const currentState = getStoredState();
    const updated = typeof nextState === 'function' ? nextState(currentState) : nextState;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
  } catch (err) {
    console.error('Failed to save Life OS state:', err);
  }
}

export function calculateMetrics(state: LifeOSState): SystemMetrics {
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter((t) => t.completed).length;
  const taskRatio = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const totalHabits = state.habits.length;
  const completedHabits = state.habits.filter((h) => h.completedToday).length;
  const habitRatio = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  const focusHours = state.focusSecondsToday / 3600;
  const focusScore = Math.min(100, Math.round((focusHours / 4) * 100)); // Target: 4h focus

  const discipline = Math.round(habitRatio * 0.6 + taskRatio * 0.4);
  const focus = Math.max(20, Math.min(99, Math.round(focusScore * 0.7 + taskRatio * 0.3)));
  const energy = Math.round(Math.min(98, 70 + (discipline > 60 ? 15 : -10)));
  const recovery = state.sleep.status === 'GOOD' ? 88 : state.sleep.status === 'FAIR' ? 68 : 45;

  return {
    focus,
    energy,
    discipline,
    recovery,
  };
}

export function logActivity(text: string, status = '✓') {
  if (typeof window === 'undefined') return;
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  saveState((prev) => {
    const logs = [...prev.activityLogs];
    if (logs.length === 0 || logs[0].date !== 'TODAY') {
      logs.unshift({ date: 'TODAY', entries: [{ time, text, status }] });
    } else {
      logs[0] = {
        ...logs[0],
        entries: [{ time, text, status }, ...logs[0].entries],
      };
    }
    return { ...prev, activityLogs: logs };
  });
}
