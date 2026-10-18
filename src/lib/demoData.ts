import { Task, Habit, SleepEntry, SleepLog, SystemMetrics, WeeklyItem, FocusSession, ActivityDayLog, LifeOSState } from './types';
import { getTodayDateString, getYesterdayDateString } from './dateUtils';

const today = getTodayDateString();
const yesterday = getYesterdayDateString();

export const demoTasks: Task[] = [
  { id: 'demo-1', title: 'Study Distributed Systems', date: today, time: '09:00', category: 'STUDY', priority: 'HIGH', completed: false },
  { id: 'demo-2', title: 'Implement database indexing', date: today, time: '11:30', category: 'WORK', priority: 'HIGH', completed: true, completedAt: `${today}T11:45:00.000Z` },
  { id: 'demo-3', title: 'System architecture review', date: today, time: '15:00', category: 'WORK', priority: 'MEDIUM', completed: false },
  { id: 'demo-4', title: '30m Zone-2 Cardio session', date: today, time: '17:30', category: 'HEALTH', priority: 'HIGH', completed: false },
  { id: 'demo-5', title: 'Read 25 pages of Clean Code', date: today, time: '21:00', category: 'GROWTH', priority: 'LOW', completed: false },
];

export const demoHabits: Habit[] = [
  { id: 'demo-h1', title: 'Morning Light & Hydration', frequency: 'Daily', weeklyTarget: 7, completedDates: [today, yesterday] },
  { id: 'demo-h2', title: 'Deep Work (2+ hrs)', frequency: 'Daily', weeklyTarget: 7, completedDates: [yesterday] },
  { id: 'demo-h3', title: 'Mindfulness Practice', frequency: 'Daily', weeklyTarget: 7, completedDates: [] },
  { id: 'demo-h4', title: 'Strength Training', frequency: '4x/week', weeklyTarget: 4, completedDates: [yesterday] },
  { id: 'demo-h5', title: 'Screen off at 22:30', frequency: 'Daily', weeklyTarget: 7, completedDates: [yesterday] },
];

export const demoSleepRecords: SleepEntry[] = [
  {
    id: 'demo-s1',
    date: today,
    start: '23:30',
    wake: '07:15',
    durationMinutes: 465,
    durationFormatted: '7h 45m',
    targetFormatted: '8h 00m',
    status: 'GOOD',
    notes: 'Restful recovery cycle',
  },
  {
    id: 'demo-s2',
    date: yesterday,
    start: '23:45',
    wake: '07:00',
    durationMinutes: 435,
    durationFormatted: '7h 15m',
    targetFormatted: '8h 00m',
    status: 'FAIR',
  },
];

export const demoWeeklyChecklist: WeeklyItem[] = [
  { id: 'demo-w1', title: 'Ship feature milestone v1.2', completed: true },
  { id: 'demo-w2', title: 'Complete 4 workout protocols', completed: false },
  { id: 'demo-w3', title: 'Review 3 systems papers', completed: false },
  { id: 'demo-w4', title: 'Maintain sleep target >= 7.5h', completed: true },
];

export const demoFocusSessions: FocusSession[] = [
  { id: 'demo-f1', projectName: 'LIFE-OS Engine', durationSeconds: 3600, timestamp: `${today}T10:00:00.000Z`, date: today },
  { id: 'demo-f2', projectName: 'Research Papers', durationSeconds: 2700, timestamp: `${today}T14:30:00.000Z`, date: today },
];

export const demoActivityLogs: ActivityDayLog[] = [
  {
    date: 'TODAY',
    entries: [
      { time: '14:30', text: 'Focus Sprint concluded: Research Papers (45 mins)', status: '⚡' },
      { time: '11:45', text: 'Task completed: Implement database indexing', status: '✓' },
      { time: '10:00', text: 'Focus Sprint concluded: LIFE-OS Engine (60 mins)', status: '⚡' },
      { time: '08:00', text: 'Habit logged: Morning Light & Hydration', status: '✓' },
      { time: '07:15', text: 'Sleep protocol logged: 7h 45m (GOOD)', status: '✓' },
      { time: '07:00', text: 'System terminal initialized', status: '>' },
    ],
  },
  {
    date: 'YESTERDAY',
    entries: [
      { time: '18:15', text: 'Habit logged: Strength Training', status: '✓' },
      { time: '15:20', text: 'Habit logged: Deep Work (2+ hrs)', status: '✓' },
    ],
  },
];

export const demoLatestSleep: SleepLog = {
  start: '23:30',
  wake: '07:15',
  total: '7h 45m',
  target: '8h 00m',
  status: 'GOOD',
};

export const demoMetrics: SystemMetrics = {
  focus: 78,
  energy: 82,
  discipline: 85,
  recovery: 88,
  isRated: true,
};

export function getDemoState(): LifeOSState {
  return {
    version: 2,
    tasks: demoTasks,
    habits: demoHabits,
    weeklyChecklist: demoWeeklyChecklist,
    sleepRecords: demoSleepRecords,
    sleep: demoLatestSleep,
    focusSessions: demoFocusSessions,
    focusSecondsToday: 6300, // 1h 45m
    focusSessionsCount: 2,
    activityLogs: demoActivityLogs,
    lastActiveDate: today,
  };
}
