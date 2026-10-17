"use client";

import { useState } from 'react';
import { useLifeOS } from '@/lib/useLifeOS';
import { SystemWindow } from '@/components/ui/SystemWindow';
import { RetroModal } from '@/components/ui/RetroModal';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HabitsScreen() {
  const { state, toggleHabit, addHabit } = useLifeOS();
  const [isNewHabitOpen, setIsNewHabitOpen] = useState(false);
  const [habitTitle, setHabitTitle] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [weeklyTarget, setWeeklyTarget] = useState(7);

  const habits = state.habits;

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    addHabit(habitTitle.trim(), frequency, Number(weeklyTarget));
    setHabitTitle('');
    setIsNewHabitOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-8 h-full">
      <header className="flex flex-wrap items-end justify-between gap-2 mb-2">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wider mb-1 uppercase">HABIT SYSTEM</h1>
          <p className="font-mono text-xs opacity-80 uppercase tracking-widest">
            {habits.filter((h) => h.completedToday).length} OF {habits.length} HABITS LOGGED TODAY
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
            <div className="p-8 text-center font-mono text-sys-line/50 text-sm bg-sys-white">
              NO HABITS ACTIVE. CLICK NEW HABIT TO START A STREAK.
            </div>
          ) : (
            habits.map((habit) => (
              <div
                key={habit.id}
                className="flex flex-col gap-2 p-4 border-2 border-sys-line bg-sys-white hover:bg-sys-pale-pink/15 transition-none group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div
                    className="flex items-center gap-3 cursor-pointer select-none"
                    onClick={() => toggleHabit(habit.id)}
                  >
                    <div
                      className={`w-4 h-4 border-2 border-sys-line flex items-center justify-center transition-none ${
                        habit.completedToday ? 'bg-sys-line' : 'bg-sys-white group-hover:bg-sys-pale-pink'
                      }`}
                    >
                      {habit.completedToday && <div className="w-2 h-2 bg-sys-white" />}
                    </div>
                    <span
                      className={`font-mono text-base sm:text-lg ${
                        habit.completedToday ? 'text-sys-line/60 line-through' : 'text-sys-line'
                      }`}
                    >
                      {habit.title}
                    </span>
                  </div>

                  <div className="text-right font-mono text-xs text-sys-line/70 flex flex-col items-end shrink-0">
                    <span className="uppercase text-[10px] tracking-wider">{habit.frequency}</span>
                    <span>
                      STREAK:{' '}
                      <span className="text-sys-pink font-bold">{habit.streak}d 🔥</span> &middot; WEEK:{' '}
                      <span className="text-sys-line font-bold">
                        {habit.weeklyCompleted}/{habit.weeklyTarget}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex gap-1 sm:gap-2 pt-2 border-t-2 border-sys-line/10">
                  {DAYS.map((day, i) => {
                    const isToday = i === 4; // Friday
                    const isChecked = isToday ? habit.completedToday : i % 2 === 0 || habit.weeklyTarget > 4;

                    return (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <span className="font-mono text-[10px] text-sys-line/50">{day}</span>
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
            ))
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
              placeholder="e.g., Cold Shower / 20m Mobility"
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
