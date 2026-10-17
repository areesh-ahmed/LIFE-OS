"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  LifeOSState,
  defaultState,
  getStoredState,
  saveState,
  calculateMetrics,
  logActivity,
} from './storage';
import { Task, Habit } from './mockData';

export function useLifeOS() {
  const [state, setState] = useState<LifeOSState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setState(getStoredState());
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

  const toggleTask = useCallback((id: string) => {
    saveState((prev) => {
      let toggledTitle = '';
      let isNowComplete = false;
      const tasks = prev.tasks.map((task) => {
        if (task.id === id) {
          toggledTitle = task.title;
          isNowComplete = !task.completed;
          return { ...task, completed: !task.completed };
        }
        return task;
      });
      if (toggledTitle) {
        logActivity(
          isNowComplete ? `Task completed: ${toggledTitle}` : `Task reopened: ${toggledTitle}`,
          isNowComplete ? '✓' : '•'
        );
      }
      return { ...prev, tasks };
    });
  }, []);

  const addTask = useCallback((title: string, category = 'WORK', priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM', time?: string) => {
    saveState((prev) => {
      const newTask: Task = {
        id: Date.now().toString(),
        title,
        category: category.toUpperCase(),
        priority,
        completed: false,
        time: time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      };
      logActivity(`New task created: ${title}`, '+');
      return {
        ...prev,
        tasks: [newTask, ...prev.tasks],
      };
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    saveState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  }, []);

  const toggleHabit = useCallback((id: string) => {
    saveState((prev) => {
      let habitTitle = '';
      let isDone = false;
      const habits = prev.habits.map((habit) => {
        if (habit.id === id) {
          habitTitle = habit.title;
          isDone = !habit.completedToday;
          const nextCompletedToday = !habit.completedToday;
          const streakDelta = nextCompletedToday ? 1 : Math.max(0, habit.streak - 1);
          const weeklyCompletedDelta = nextCompletedToday ? habit.weeklyCompleted + 1 : Math.max(0, habit.weeklyCompleted - 1);
          return {
            ...habit,
            completedToday: nextCompletedToday,
            streak: nextCompletedToday ? habit.streak + 1 : streakDelta,
            weeklyCompleted: weeklyCompletedDelta,
          };
        }
        return habit;
      });
      if (habitTitle) {
        logActivity(isDone ? `Habit logged: ${habitTitle}` : `Habit unmarked: ${habitTitle}`, isDone ? '✓' : '•');
      }
      return { ...prev, habits };
    });
  }, []);

  const addHabit = useCallback((title: string, frequency = 'Daily', weeklyTarget = 7) => {
    saveState((prev) => {
      const newHabit: Habit = {
        id: Date.now().toString(),
        title,
        frequency,
        weeklyTarget,
        weeklyCompleted: 0,
        completedToday: false,
        streak: 0,
      };
      logActivity(`New habit tracked: ${title}`, '+');
      return {
        ...prev,
        habits: [...prev.habits, newHabit],
      };
    });
  }, []);

  const toggleWeekly = useCallback((id: string) => {
    saveState((prev) => ({
      ...prev,
      weeklyChecklist: prev.weeklyChecklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
  }, []);

  const addWeekly = useCallback((title: string) => {
    saveState((prev) => ({
      ...prev,
      weeklyChecklist: [
        ...prev.weeklyChecklist,
        { id: Date.now().toString(), title, completed: false },
      ],
    }));
    logActivity(`Added weekly goal: ${title}`, '+');
  }, []);

  const finishFocusSession = useCallback((durationSeconds: number, projectName: string) => {
    saveState((prev) => {
      const minutes = Math.round(durationSeconds / 60);
      logActivity(`Focus sprint concluded: ${projectName} (${minutes} mins)`, '⚡');
      return {
        ...prev,
        focusSecondsToday: prev.focusSecondsToday + durationSeconds,
        focusSessionsCount: prev.focusSessionsCount + 1,
      };
    });
  }, []);

  const addCustomLog = useCallback((text: string) => {
    logActivity(text, '>');
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
    toggleWeekly,
    addWeekly,
    finishFocusSession,
    addCustomLog,
  };
}
