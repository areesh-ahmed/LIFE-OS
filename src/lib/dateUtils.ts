/**
 * Date and time utilities for LIFE-OS
 * Respects local timezone and handles calendar calculations
 */

export function getTodayDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getTodayDateString(d);
}

export function formatTimeNow(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
}

export function formatMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0h 00m';
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}h ${String(mins).padStart(2, '0')}m`;
}

/**
 * Calculates sleep duration in minutes given start and wake time in HH:MM format.
 * Correctly accounts for overnight sleep crossing midnight.
 */
export function calculateSleepDuration(startTime: string, wakeTime: string): { minutes: number; formatted: string } {
  if (!startTime || !wakeTime) {
    return { minutes: 0, formatted: '0h 00m' };
  }

  const [startH, startM] = startTime.split(':').map((v) => parseInt(v, 10) || 0);
  const [wakeH, wakeM] = wakeTime.split(':').map((v) => parseInt(v, 10) || 0);

  const startTotalMinutes = startH * 60 + startM;
  const wakeTotalMinutes = wakeH * 60 + wakeM;

  let diffMinutes = wakeTotalMinutes - startTotalMinutes;
  if (diffMinutes <= 0) {
    // Crossed midnight: e.g., 23:00 to 07:00 => (1440 - 1380) + 420 = 480
    diffMinutes += 24 * 60;
  }

  return {
    minutes: diffMinutes,
    formatted: formatMinutes(diffMinutes),
  };
}

export interface WeekDayInfo {
  dateStr: string; // YYYY-MM-DD
  dayShort: string; // 'MON', 'TUE', etc.
  dayLetter: string; // 'M', 'T', 'W', etc.
  dayNumber: number; // 1-31
  monthShort: string; // 'Jan', 'Feb', etc.
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

/**
 * Returns the 7 days of the current week (Monday to Sunday)
 */
export function getCurrentWeekDates(refDate: Date = new Date()): WeekDayInfo[] {
  const current = new Date(refDate);
  current.setHours(0, 0, 0, 0);

  // JavaScript getDay() returns 0 for Sunday, 1 for Monday, etc.
  // We want Monday as the first day (index 0) through Sunday (index 6).
  const dayOfWeek = current.getDay(); // 0 is Sun, 1 is Mon, ... 6 is Sat
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(current);
  monday.setDate(current.getDate() + distanceToMonday);

  const todayStr = getTodayDateString(refDate);
  const daysShort = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const daysLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const week: WeekDayInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = getTodayDateString(d);

    week.push({
      dateStr,
      dayShort: daysShort[i],
      dayLetter: daysLetters[i],
      dayNumber: d.getDate(),
      monthShort: d.toLocaleDateString('en-US', { month: 'short' }),
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
      isFuture: dateStr > todayStr,
    });
  }

  return week;
}

export function isDateInCurrentWeek(dateStr: string, refDate: Date = new Date()): boolean {
  const week = getCurrentWeekDates(refDate);
  return week.some((w) => w.dateStr === dateStr);
}

/**
 * Calculates genuine consecutive day streak from a list of completed dates (YYYY-MM-DD).
 * Streak is active if completed today, or if completed yesterday (waiting for today's completion).
 */
export function calculateStreak(completedDates: string[] = [], todayStr: string = getTodayDateString()): string extends never ? never : number {
  if (!completedDates || completedDates.length === 0) return 0;

  const dateSet = new Set(completedDates);

  // Check if today is completed
  const completedToday = dateSet.has(todayStr);

  // If not completed today, start checking backwards from yesterday
  const checkDate = new Date();
  if (!completedToday) {
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = getTodayDateString(checkDate);
    // If yesterday is also not completed, streak is 0
    if (!dateSet.has(yesterdayStr)) {
      return 0;
    }
  }

  let streak = 0;
  while (true) {
    const currentCheckStr = getTodayDateString(checkDate);
    if (dateSet.has(currentCheckStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
