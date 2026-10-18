"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  createEmptyState,
  getStoredState,
  saveState,
  calculateMetrics,
  logActivity,
} from './storage';
import { LifeOSState, Task, Habit, SleepEntry, Priority, SleepQuality } from './types';
import {
  getTodayDateString,
  calculateSleepDuration,
} from './dateUtils';
import { getDemoState } from './demoData';

export function useLifeOS() {
  const [state, setState] = useState<LifeOSState>(createEmptyState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Read actual storage on mount (avoids hydration mismatch)
    const stored = getStoredState();
    setState(stored);
    setIsLoaded(true);

    const handleStorageUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<LifeOSState>;
      if (customEvent.detail) {
        setState(customEvent.detail);
      } else {
        setState(getStoredState());
      }
    };

    window.addEventListener('life_os_state_update', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('life_os_state_update', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // ---------------- TASKS ----------------
  const toggleTask = useCallback((id: string) => {
    saveState((prev) => {
      let taskTitle = '';
      let isNowComplete = false;
      const tasks = prev.tasks.map((task) => {
        if (task.id === id) {
          taskTitle = task.title;
          isNowComplete = !task.completed;
          return {
            ...task,
            completed: isNowComplete,
            completedAt: isNowComplete ? new Date().toISOString() : undefined,
          };
        }
        return task;
      });
      if (taskTitle) {
        logActivity(
          isNowComplete ? `Task completed: ${taskTitle}` : `Task reopened: ${taskTitle}`,
          isNowComplete ? '✓' : '•'
        );
      }
      return { ...prev, tasks };
    });
  }, []);

  const addTask = useCallback(
    (
      title: string,
      category = 'WORK',
      priority: Priority = 'MEDIUM',
      time?: string,
      date?: string
    ) => {
      saveState((prev) => {
        const newTask: Task = {
          id: Date.now().toString(),
          title: title.trim(),
          category: category.toUpperCase(),
          priority,
          completed: false,
          date: date || getTodayDateString(),
          time: time || undefined,
        };
        logActivity(`New task registered: ${newTask.title}`, '+');
        return {
          ...prev,
          tasks: [newTask, ...prev.tasks],
        };
      });
    },
    []
  );

  const deleteTask = useCallback((id: string) => {
    saveState((prev) => {
      const target = prev.tasks.find((t) => t.id === id);
      if (target) {
        logActivity(`Task purged: ${target.title}`, '×');
      }
      return {
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== id),
      };
    });
  }, []);

  // ---------------- HABITS ----------------
  const toggleHabit = useCallback((id: string, dateStr: string = getTodayDateString()) => {
    saveState((prev) => {
      let habitTitle = '';
      let isDone = false;
      const habits = prev.habits.map((habit) => {
        if (habit.id === id) {
          habitTitle = habit.title;
          const currentDates = habit.completedDates || [];
          const exists = currentDates.includes(dateStr);
          isDone = !exists;
          const nextDates = exists
            ? currentDates.filter((d) => d !== dateStr)
            : [...currentDates, dateStr];

          return {
            ...habit,
            completedDates: nextDates,
          };
        }
        return habit;
      });
      if (habitTitle) {
        logActivity(
          isDone ? `Habit logged: ${habitTitle}` : `Habit unmarked: ${habitTitle}`,
          isDone ? '✓' : '•'
        );
      }
      return { ...prev, habits };
    });
  }, []);

  const addHabit = useCallback((title: string, frequency = 'Daily', weeklyTarget = 7) => {
    saveState((prev) => {
      const newHabit: Habit = {
        id: Date.now().toString(),
        title: title.trim(),
        frequency,
        weeklyTarget: Math.max(1, Math.min(7, weeklyTarget)),
        completedDates: [],
      };
      logActivity(`New habit protocol initialized: ${newHabit.title}`, '+');
      return {
        ...prev,
        habits: [...prev.habits, newHabit],
      };
    });
  }, []);

  const deleteHabit = useCallback((id: string) => {
    saveState((prev) => {
      const target = prev.habits.find((h) => h.id === id);
      if (target) {
        logActivity(`Habit deleted: ${target.title}`, '×');
      }
      return {
        ...prev,
        habits: prev.habits.filter((h) => h.id !== id),
      };
    });
  }, []);

  // ---------------- WEEKLY GOALS ----------------
  const toggleWeekly = useCallback((id: string) => {
    saveState((prev) => {
      let itemTitle = '';
      let isDone = false;
      const weeklyChecklist = prev.weeklyChecklist.map((item) => {
        if (item.id === id) {
          itemTitle = item.title;
          isDone = !item.completed;
          return { ...item, completed: !item.completed };
        }
        return item;
      });
      if (itemTitle) {
        logActivity(
          isDone ? `Weekly goal achieved: ${itemTitle}` : `Weekly goal reopened: ${itemTitle}`,
          isDone ? '✓' : '•'
        );
      }
      return { ...prev, weeklyChecklist };
    });
  }, []);

  const addWeekly = useCallback((title: string) => {
    saveState((prev) => {
      const newItem = {
        id: Date.now().toString(),
        title: title.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      logActivity(`Added weekly objective: ${newItem.title}`, '+');
      return {
        ...prev,
        weeklyChecklist: [...prev.weeklyChecklist, newItem],
      };
    });
  }, []);

  const deleteWeekly = useCallback((id: string) => {
    saveState((prev) => ({
      ...prev,
      weeklyChecklist: prev.weeklyChecklist.filter((w) => w.id !== id),
    }));
  }, []);

  // ---------------- SLEEP LOGGING ----------------
  const logSleep = useCallback(
    (params: {
      date: string;
      start: string;
      wake: string;
      targetFormatted?: string;
      status: SleepQuality;
      notes?: string;
    }) => {
      const duration = calculateSleepDuration(params.start, params.wake);
      const newEntry: SleepEntry = {
        id: Date.now().toString(),
        date: params.date || getTodayDateString(),
        start: params.start,
        wake: params.wake,
        durationMinutes: duration.minutes,
        durationFormatted: duration.formatted,
        targetFormatted: params.targetFormatted || '8h 00m',
        status: params.status || 'GOOD',
        notes: params.notes,
      };

      saveState((prev) => {
        // Filter out any existing record for the exact same date to prevent duplicates
        const filtered = prev.sleepRecords.filter((s) => s.date !== newEntry.date);
        const updatedRecords = [newEntry, ...filtered];
        logActivity(
          `Sleep recorded for ${newEntry.date}: ${newEntry.durationFormatted} [${newEntry.status}]`,
          '✓'
        );
        return {
          ...prev,
          sleepRecords: updatedRecords,
          sleep: {
            start: newEntry.start,
            wake: newEntry.wake,
            total: newEntry.durationFormatted,
            target: newEntry.targetFormatted,
            status: newEntry.status,
          },
        };
      });
    },
    []
  );

  const deleteSleep = useCallback((id: string) => {
    saveState((prev) => {
      const updated = prev.sleepRecords.filter((s) => s.id !== id);
      return {
        ...prev,
        sleepRecords: updated,
      };
    });
  }, []);

  // ---------------- FOCUS SESSIONS ----------------
  const finishFocusSession = useCallback((durationSeconds: number, projectName: string) => {
    const todayStr = getTodayDateString();
    const newSession = {
      id: Date.now().toString(),
      projectName: projectName.trim() || 'Deep Work',
      durationSeconds,
      timestamp: new Date().toISOString(),
      date: todayStr,
    };

    saveState((prev) => {
      const minutes = Math.max(1, Math.round(durationSeconds / 60));
      logActivity(`Focus sprint concluded: ${newSession.projectName} (${minutes} mins)`, '⚡');
      const sessions = [newSession, ...prev.focusSessions];
      const todayTotal = sessions
        .filter((s) => s.date === todayStr)
        .reduce((sum, s) => sum + s.durationSeconds, 0);

      return {
        ...prev,
        focusSessions: sessions,
        focusSecondsToday: todayTotal,
        focusSessionsCount: sessions.filter((s) => s.date === todayStr).length,
      };
    });
  }, []);

  // ---------------- ACTIVITY LOGS ----------------
  const addCustomLog = useCallback((text: string) => {
    logActivity(text, '>');
  }, []);

  const clearLogs = useCallback(() => {
    saveState((prev) => ({
      ...prev,
      activityLogs: [],
    }));
  }, []);

  // ---------------- SYSTEM / DATA MANAGEMENT ----------------
  const loadDemoData = useCallback(() => {
    const demo = getDemoState();
    saveState(demo);
  }, []);

  const resetData = useCallback(() => {
    const empty = createEmptyState();
    saveState(empty);
    logActivity('System storage initialized. Clean state active.', '>');
  }, []);

  const importData = useCallback((imported: LifeOSState) => {
    saveState(imported);
    logActivity('System backup data successfully imported.', '✓');
  }, []);

  const metrics = calculateMetrics(state);

  return {
    state,
    metrics,
    isLoaded,
    toggleTask,
    addTask,
    deleteTask,
    toggleHabit,
    addHabit,
    deleteHabit,
    toggleWeekly,
    addWeekly,
    deleteWeekly,
    logSleep,
    deleteSleep,
    finishFocusSession,
    addCustomLog,
    clearLogs,
    loadDemoData,
    resetData,
    importData,
  };
}
