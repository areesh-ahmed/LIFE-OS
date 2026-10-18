/* eslint-disable @typescript-eslint/no-explicit-any */
export * from './types';
import {
  LifeOSState,
  Task,
  Habit,
  SleepEntry,
  SleepLog,
  WeeklyItem,
  FocusSession,
  ActivityDayLog,
  SystemMetrics,
} from './types';
import {
  getTodayDateString,
  calculateStreak,
  isDateInCurrentWeek,
  formatTimeNow,
} from './dateUtils';

export const STORAGE_KEY_V2 = 'life_os_local_data_v2';
export const STORAGE_KEY_V1 = 'life_os_local_data_v1';
export const EVENT_NAME = 'life_os_state_update';

/**
 * Creates an immutable fresh-user empty state
 */
export function createEmptyState(): LifeOSState {
  return {
    version: 2,
    tasks: [],
    habits: [],
    weeklyChecklist: [],
    sleepRecords: [],
    sleep: null,
    focusSessions: [],
    focusSecondsToday: 0,
    focusSessionsCount: 0,
    activityLogs: [],
    lastActiveDate: getTodayDateString(),
  };
}

export const defaultState: LifeOSState = createEmptyState();

// Known seed signatures from legacy v1 default state
const SEED_TASK_SIGNATURES: Record<string, string> = {
  '1': 'Study Java',
  '2': 'Complete assignment',
  '3': 'Project work',
  '4': 'Workout',
  '5': 'Read 20 pages',
};

const SEED_HABIT_SIGNATURES: Record<string, string> = {
  '1': 'Wake up on time',
  '2': 'Drink water',
  '3': 'Meditation',
  '4': 'Reading',
  '5': 'Exercise',
};

const SEED_WEEKLY_SIGNATURES: Record<string, string> = {
  '1': 'Finish Java assignment',
  '2': 'Workout 4 times',
  '3': 'Read 100 pages',
  '4': 'Complete project milestone',
  '5': 'Sleep before 12 AM',
};

const SEED_ACTIVITY_SNIPPETS = [
  'System boot sequence initiated',
  'Java — Binary Search practice',
  'Hydration target: 1L completed',
  'Focus Sprint #1 concluded',
  'Data structures review',
  'Gym session: Strength routine',
  'Sleep protocol initiated',
];

/**
 * Safely migrates legacy v1 stored data to v2 format.
 * Preserves genuine user data while stripping known synthetic fixtures.
 */
export function migrateLegacyState(v1Data: any): LifeOSState {
  const fresh = createEmptyState();
  if (!v1Data || typeof v1Data !== 'object') {
    return fresh;
  }

  const todayStr = getTodayDateString();

  // 1. Migrate tasks: keep tasks that do not match the exact seed signature
  let migratedTasks: Task[] = [];
  if (Array.isArray(v1Data.tasks)) {
    migratedTasks = v1Data.tasks
      .filter((t: any) => {
        if (!t || typeof t !== 'object') return false;
        // Check if matches seed signature
        if (t.id in SEED_TASK_SIGNATURES && t.title === SEED_TASK_SIGNATURES[t.id]) {
          return false;
        }
        return true;
      })
      .map((t: any) => ({
        id: String(t.id || Date.now() + Math.random()),
        title: String(t.title || 'Untitled Task'),
        date: typeof t.date === 'string' ? t.date : todayStr,
        time: typeof t.time === 'string' ? t.time : undefined,
        category: typeof t.category === 'string' ? t.category : 'WORK',
        priority: t.priority === 'HIGH' || t.priority === 'LOW' ? t.priority : 'MEDIUM',
        completed: Boolean(t.completed),
        completedAt: t.completedAt,
      }));
  }

  // 2. Migrate habits: preserve genuine user habits, remove known seed fixtures
  let migratedHabits: Habit[] = [];
  if (Array.isArray(v1Data.habits)) {
    migratedHabits = v1Data.habits
      .filter((h: any) => {
        if (!h || typeof h !== 'object') return false;
        if (h.id in SEED_HABIT_SIGNATURES && h.title === SEED_HABIT_SIGNATURES[h.id]) {
          return false;
        }
        return true;
      })
      .map((h: any) => {
        let completedDates: string[] = Array.isArray(h.completedDates) ? h.completedDates : [];
        if (completedDates.length === 0 && h.completedToday) {
          completedDates = [todayStr];
        }
        return {
          id: String(h.id || Date.now() + Math.random()),
          title: String(h.title || 'Untitled Habit'),
          frequency: typeof h.frequency === 'string' ? h.frequency : 'Daily',
          weeklyTarget: typeof h.weeklyTarget === 'number' ? h.weeklyTarget : 7,
          completedDates,
        };
      });
  }

  // 3. Migrate weekly items: remove known seed weekly goals
  let migratedWeekly: WeeklyItem[] = [];
  if (Array.isArray(v1Data.weeklyChecklist)) {
    migratedWeekly = v1Data.weeklyChecklist
      .filter((w: any) => {
        if (!w || typeof w !== 'object') return false;
        if (w.id in SEED_WEEKLY_SIGNATURES && w.title === SEED_WEEKLY_SIGNATURES[w.id]) {
          return false;
        }
        return true;
      })
      .map((w: any) => ({
        id: String(w.id || Date.now() + Math.random()),
        title: String(w.title || 'Untitled Goal'),
        completed: Boolean(w.completed),
      }));
  }

  // 4. Migrate sleep: remove mockSleep fixture (23:47 -> 07:18 with 7h 31m)
  let migratedSleepRecords: SleepEntry[] = [];
  let migratedSleep: SleepLog | null = null;
  if (Array.isArray(v1Data.sleepRecords)) {
    migratedSleepRecords = v1Data.sleepRecords.filter((s: any) => s && s.durationMinutes);
  }
  if (v1Data.sleep && typeof v1Data.sleep === 'object') {
    const isMock =
      v1Data.sleep.start === '23:47' &&
      v1Data.sleep.wake === '07:18' &&
      v1Data.sleep.total === '7h 31m';
    if (!isMock && v1Data.sleep.start && v1Data.sleep.wake) {
      migratedSleep = {
        start: v1Data.sleep.start,
        wake: v1Data.sleep.wake,
        total: v1Data.sleep.total || '0h 00m',
        target: v1Data.sleep.target || '8h 00m',
        status: v1Data.sleep.status || 'GOOD',
      };
    }
  }

  // 5. Migrate focus: remove synthetic default (7320s and 3 sessions)
  let focusSecondsToday = 0;
  let focusSessionsCount = 0;
  let focusSessions: FocusSession[] = [];
  if (Array.isArray(v1Data.focusSessions)) {
    focusSessions = v1Data.focusSessions;
    focusSessionsCount = focusSessions.length;
    // Calculate today's focus seconds from actual sessions
    focusSecondsToday = focusSessions
      .filter((s) => s.date === todayStr)
      .reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
  } else if (
    typeof v1Data.focusSecondsToday === 'number' &&
    v1Data.focusSecondsToday !== 7320 &&
    v1Data.focusSecondsToday > 0
  ) {
    focusSecondsToday = v1Data.focusSecondsToday;
    focusSessionsCount = typeof v1Data.focusSessionsCount === 'number' ? v1Data.focusSessionsCount : 1;
  }

  // 6. Migrate activity logs: remove days that only have seed activities
  let migratedLogs: ActivityDayLog[] = [];
  if (Array.isArray(v1Data.activityLogs)) {
    migratedLogs = v1Data.activityLogs
      .map((dayLog: any) => {
        if (!dayLog || !Array.isArray(dayLog.entries)) return null;
        const genuineEntries = dayLog.entries.filter(
          (entry: any) => !SEED_ACTIVITY_SNIPPETS.some((snippet) => entry.text && entry.text.includes(snippet))
        );
        if (genuineEntries.length === 0) return null;
        return {
          date: dayLog.date || 'TODAY',
          entries: genuineEntries,
        };
      })
      .filter(Boolean) as ActivityDayLog[];
  }

  return {
    version: 2,
    tasks: migratedTasks,
    habits: migratedHabits,
    weeklyChecklist: migratedWeekly,
    sleepRecords: migratedSleepRecords,
    sleep: migratedSleep,
    focusSessions,
    focusSecondsToday,
    focusSessionsCount,
    activityLogs: migratedLogs,
    lastActiveDate: todayStr,
  };
}

/**
 * Loads current state from localStorage with safe fallback and migration
 */
export function getStoredState(): LifeOSState {
  if (typeof window === 'undefined') {
    return createEmptyState();
  }

  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (parsed && typeof parsed === 'object') {
        return ensureStateIntegrity(parsed);
      }
    }

    // Check for v1 data to migrate
    const rawV1 = localStorage.getItem(STORAGE_KEY_V1);
    if (rawV1) {
      const parsedV1 = JSON.parse(rawV1);
      const migrated = migrateLegacyState(parsedV1);
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migrated));
      return migrated;
    }

    // First run: return clean empty state without writing mock fixtures
    const fresh = createEmptyState();
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(fresh));
    return fresh;
  } catch (err) {
    console.warn('Failed to parse LIFE-OS storage, using empty state:', err);
    return createEmptyState();
  }
}

/**
 * Validates and repairs state shape, handles day rollover, and derives helper values
 */
export function ensureStateIntegrity(state: any): LifeOSState {
  const todayStr = getTodayDateString();

  const isDayChanged = state.lastActiveDate && state.lastActiveDate !== todayStr;

  // Hydrate habits with computed fields
  const habits: Habit[] = Array.isArray(state.habits)
    ? state.habits.map((h: any) => {
        const completedDates: string[] = Array.isArray(h.completedDates) ? h.completedDates : [];
        const completedToday = completedDates.includes(todayStr);
        const streak = calculateStreak(completedDates, todayStr);
        const weeklyCompleted = completedDates.filter((d) => isDateInCurrentWeek(d)).length;

        return {
          id: String(h.id || Date.now() + Math.random()),
          title: String(h.title || 'Untitled Habit'),
          frequency: String(h.frequency || 'Daily'),
          weeklyTarget: Number(h.weeklyTarget) || 7,
          completedDates,
          completedToday,
          streak,
          weeklyCompleted,
        };
      })
    : [];

  const tasks: Task[] = Array.isArray(state.tasks)
    ? state.tasks.map((t: any) => ({
        id: String(t.id || Date.now() + Math.random()),
        title: String(t.title || 'Untitled Task'),
        date: String(t.date || todayStr),
        time: t.time ? String(t.time) : undefined,
        category: String(t.category || 'WORK'),
        priority: t.priority === 'HIGH' || t.priority === 'LOW' ? t.priority : 'MEDIUM',
        completed: Boolean(t.completed),
        completedAt: t.completedAt,
      }))
    : [];

  const weeklyChecklist: WeeklyItem[] = Array.isArray(state.weeklyChecklist)
    ? state.weeklyChecklist.map((w: any) => ({
        id: String(w.id || Date.now() + Math.random()),
        title: String(w.title || 'Untitled Goal'),
        completed: Boolean(w.completed),
        createdAt: w.createdAt,
      }))
    : [];

  const sleepRecords: SleepEntry[] = Array.isArray(state.sleepRecords) ? state.sleepRecords : [];

  // Derive latest sleep from sleepRecords if available, or fall back to state.sleep
  let latestSleep: SleepLog | null = null;
  if (sleepRecords.length > 0) {
    const sorted = [...sleepRecords].sort((a, b) => b.date.localeCompare(a.date));
    const latest = sorted[0];
    latestSleep = {
      start: latest.start,
      wake: latest.wake,
      total: latest.durationFormatted,
      target: latest.targetFormatted,
      status: latest.status,
    };
  } else if (state.sleep && state.sleep.start && state.sleep.wake) {
    latestSleep = state.sleep;
  }

  const focusSessions: FocusSession[] = Array.isArray(state.focusSessions) ? state.focusSessions : [];

  // Compute focus seconds today from sessions if available, or reset on day rollover
  let focusSecondsToday = 0;
  if (focusSessions.length > 0) {
    focusSecondsToday = focusSessions
      .filter((s) => s.date === todayStr)
      .reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
  } else if (!isDayChanged && typeof state.focusSecondsToday === 'number') {
    focusSecondsToday = state.focusSecondsToday;
  }

  const focusSessionsCount = focusSessions.length > 0
    ? focusSessions.filter((s) => s.date === todayStr).length
    : isDayChanged ? 0 : (Number(state.focusSessionsCount) || 0);

  const activityLogs: ActivityDayLog[] = Array.isArray(state.activityLogs) ? state.activityLogs : [];

  return {
    version: 2,
    tasks,
    habits,
    weeklyChecklist,
    sleepRecords,
    sleep: latestSleep,
    focusSessions,
    focusSecondsToday,
    focusSessionsCount,
    activityLogs,
    lastActiveDate: todayStr,
  };
}

/**
 * Saves next state to localStorage and dispatches sync event
 */
export function saveState(nextState: LifeOSState | ((prev: LifeOSState) => LifeOSState)) {
  if (typeof window === 'undefined') return;
  try {
    const currentState = getStoredState();
    const resolved = typeof nextState === 'function' ? nextState(currentState) : nextState;
    const sanitized = ensureStateIntegrity(resolved);
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(sanitized));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: sanitized }));
  } catch (err) {
    console.error('Failed to save LIFE-OS state:', err);
  }
}

/**
 * Calculates genuine system metrics derived strictly from actual user data.
 * When no data exists, scores return 0 with isRated: false.
 */
export function calculateMetrics(state: LifeOSState): SystemMetrics {
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter((t) => t.completed).length;
  const taskRatio = totalTasks > 0 ? completedTasks / totalTasks : 0;

  const totalHabits = state.habits.length;
  const completedHabits = state.habits.filter((h) => h.completedToday).length;
  const habitRatio = totalHabits > 0 ? completedHabits / totalHabits : 0;

  const focusHours = (state.focusSecondsToday || 0) / 3600;
  // Focus score based on 4-hour target
  const focusScore = Math.min(100, Math.round((focusHours / 4) * 100));

  const hasSleep = Boolean(state.sleep && state.sleep.total);
  const recoveryScore = hasSleep
    ? state.sleep?.status === 'GOOD'
      ? 90
      : state.sleep?.status === 'FAIR'
      ? 70
      : 45
    : 0;

  const hasAnyData = totalTasks > 0 || totalHabits > 0 || focusHours > 0 || hasSleep;

  if (!hasAnyData) {
    return {
      focus: 0,
      energy: 0,
      discipline: 0,
      recovery: 0,
      isRated: false,
    };
  }

  // Discipline is derived from habit and task consistency
  let discipline = 0;
  if (totalHabits > 0 && totalTasks > 0) {
    discipline = Math.round(habitRatio * 60 + taskRatio * 40);
  } else if (totalHabits > 0) {
    discipline = Math.round(habitRatio * 100);
  } else if (totalTasks > 0) {
    discipline = Math.round(taskRatio * 100);
  }

  // Focus score derived from deep work sessions and completed tasks
  let focus = 0;
  if (focusHours > 0 && totalTasks > 0) {
    focus = Math.round(focusScore * 0.7 + taskRatio * 30);
  } else if (focusHours > 0) {
    focus = focusScore;
  } else if (totalTasks > 0) {
    focus = Math.round(taskRatio * 80);
  }

  // Energy is derived from sleep recovery and operational momentum
  let energy = 0;
  if (hasSleep && discipline > 0) {
    energy = Math.round(recoveryScore * 0.6 + discipline * 0.4);
  } else if (hasSleep) {
    energy = recoveryScore;
  } else if (discipline > 0) {
    energy = Math.round(discipline * 0.8);
  }

  return {
    focus: Math.min(100, focus),
    energy: Math.min(100, energy),
    discipline: Math.min(100, discipline),
    recovery: recoveryScore,
    isRated: true,
  };
}

/**
 * Logs a system or user activity to the chronological terminal log
 */
export function logActivity(text: string, status = '✓') {
  if (typeof window === 'undefined') return;
  const time = formatTimeNow();

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
