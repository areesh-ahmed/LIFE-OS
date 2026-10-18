/**
 * Legacy mockData export for backward compatibility.
 * Types are now defined in @/lib/types.
 * Demo fixtures are now in @/lib/demoData.
 */

export * from './types';
export {
  demoTasks as initialTasks,
  demoHabits as initialHabits,
  demoLatestSleep as mockSleep,
  demoMetrics as mockMetrics,
} from './demoData';
