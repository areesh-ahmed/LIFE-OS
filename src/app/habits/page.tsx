"use client";

import { useState } from 'react';
import { useLifeOS } from '@/lib/useLifeOS';
import { SystemWindow } from '@/components/ui/SystemWindow';
import { RetroModal } from '@/components/ui/RetroModal';
import { getCurrentWeekDates, getTodayDateString } from '@/lib/dateUtils';

export default function HabitsScreen() {
  const { state, toggleHabit, addHabit, deleteHabit } = useLifeOS();
  const [isNewHabitOpen, setIsNewHabitOpen] = useState(false);
  const [habitTitle, setHabitTitle] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [weeklyTarget, setWeeklyTarget] = useState(7);

  const habits = state.habits;
  const todayStr = getTodayDateString();
  const weekDays = getCurrentWeekDates();

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    addHabit(habitTitle.trim(), frequency, Number(weeklyTarget));
    setHabitTitle('');
    setIsNewHabitOpen(false);
  };

  const completedTodayCount = habits.filter((h) => h.completedToday).length;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-8 h-full">
      <header className="flex flex-wrap items-end justify-between gap-2 mb-2">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wider mb-1 uppercase">HABIT SYSTEM</h1>
          <p className="font-mono text-xs opacity-80 uppercase tracking-widest">
            {completedTodayCount} OF {habits.length} HABITS LOGGED TODAY
          </p>
        </div>
      </header>

      <SystemWindow title="HABIT TRACKER" className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <div className="font-mono text-xs opacity-70">
            TOTAL ACTIVE PROTOCOLS: {habits.length}
          </div>
          <button
            onClick={() => setIsNewHabitOpen(true)}
            className="retro-button"
          >
            + NEW HABIT
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {habits.length === 0 ? (
            <div className="p-8 text-center font-mono border-2 border-dashed border-sys-line/30 bg-sys-pale-pink/5 flex flex-col items-center justify-center gap-2">
              <span className="font-bold text-sys-pink text-sm">[ NO HABITS ACTIVE ]</span>
              <span className="text-sys-line/70 text-xs">
                INITIALIZE A NEW HABIT PROTOCOL TO BEGIN STREAK TRACKING.
              </span>
              <button
                onClick={() => setIsNewHabitOpen(true)}
                className="mt-3 retro-border px-4 py-2 font-mono text-xs font-bold hover:bg-sys-pale-pink"
              >
                + NEW HABIT
              </button>
            </div>
          ) : (
            habits.map((habit) => {
              const completedDates = habit.completedDates || [];
              const isCompletedToday = completedDates.includes(todayStr);

              return (
                <div
                  key={habit.id}
                  className="flex flex-col gap-2 p-4 border-2 border-sys-line bg-sys-white hover:bg-sys-pale-pink/15 transition-none group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div
                      className="flex items-center gap-3 cursor-pointer select-none flex-1"
                      onClick={() => toggleHabit(habit.id, todayStr)}
                    >
                      <div
                        className={`w-4 h-4 border-2 border-sys-line flex items-center justify-center transition-none ${
                          isCompletedToday ? 'bg-sys-line' : 'bg-sys-white group-hover:bg-sys-pale-pink'
                        }`}
                      >
                        {isCompletedToday && <div className="w-2 h-2 bg-sys-white" />}
                      </div>
                      <span
                        className={`font-mono text-base sm:text-lg ${
                          isCompletedToday ? 'text-sys-line/60 line-through' : 'text-sys-line'
                        }`}
                      >
                        {habit.title}
                      </span>
                    </div>

                    <div className="text-right font-mono text-xs text-sys-line/70 flex items-center gap-3 shrink-0">
                      <div className="flex flex-col items-end">
                        <span className="uppercase text-[10px] tracking-wider">{habit.frequency}</span>
                        <span>
                          STREAK:{' '}
                          <span className="text-sys-pink font-bold">{habit.streak || 0}d 🔥</span> &middot; WEEK:{' '}
                          <span className="text-sys-line font-bold">
                            {habit.weeklyCompleted || 0}/{habit.weeklyTarget}
                          </span>
                        </span>
                      </div>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-sys-pink text-sys-line font-mono text-xs px-1"
                        title="Delete habit"
                      >
                        [×]
                      </button>
                    </div>
                  </div>

                  {/* Real Days Matrix for Current Week */}
                  <div className="mt-2 flex gap-1 sm:gap-2 pt-2 border-t-2 border-sys-line/10 select-none">
                    {weekDays.map((day) => {
                      const isChecked = completedDates.includes(day.dateStr);

                      return (
                        <div
                          key={day.dateStr}
                          onClick={() => {
                            // Allow clicking any past or today date to log retroactively
                            if (!day.isFuture) {
                              toggleHabit(habit.id, day.dateStr);
                            }
                          }}
                          className={`flex flex-col items-center gap-1 flex-1 py-1 border ${
                            day.isToday
                              ? 'border-sys-pink bg-sys-pink/10'
                              : 'border-transparent hover:border-sys-line/20'
                          } ${!day.isFuture ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
                          title={`${day.dayShort} ${day.monthShort} ${day.dayNumber}: ${isChecked ? 'Completed' : 'Not completed'}`}
                        >
                          <span className="font-mono text-[10px] text-sys-line/70 flex items-center gap-0.5">
                            {day.dayLetter}
                            <span className="text-[9px] opacity-60">.{day.dayNumber}</span>
                          </span>
                          <div className="font-mono text-base font-bold">
                            {isChecked ? (
                              <span className="text-sys-pink">✓</span>
                            ) : (
                              <span className="text-sys-line/25">-</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SystemWindow>

      {/* New Habit Modal */}
      <RetroModal
        isOpen={isNewHabitOpen}
        onClose={() => setIsNewHabitOpen(false)}
        title="TRACK NEW HABIT"
      >
        <form onSubmit={handleCreateHabit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold">HABIT PROTOCOL NAME</label>
            <input
              type="text"
              required
              value={habitTitle}
              onChange={(e) => setHabitTitle(e.target.value)}
              placeholder="e.g., Morning Sunlight / 20m Mobility"
              className="retro-border px-3 py-2 bg-sys-white outline-none focus:bg-sys-pale-pink/20"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold">FREQUENCY</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="retro-border px-2 py-2 bg-sys-white outline-none"
              >
                <option value="Daily">Daily</option>
                <option value="5x/week">5x/week</option>
                <option value="4x/week">4x/week</option>
                <option value="3x/week">3x/week</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold">WEEKLY TARGET</label>
              <input
                type="number"
                min={1}
                max={7}
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                className="retro-border px-3 py-2 bg-sys-white outline-none focus:bg-sys-pale-pink/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t-2 border-sys-line mt-2">
            <button
              type="button"
              onClick={() => setIsNewHabitOpen(false)}
              className="retro-border px-4 py-2 hover:bg-sys-pale-pink/30 font-bold transition-none"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="retro-border px-5 py-2 bg-sys-line text-sys-white hover:bg-sys-pink hover:text-sys-base font-bold transition-none"
            >
              [ + SAVE HABIT ]
            </button>
          </div>
        </form>
      </RetroModal>
    </div>
  );
}
