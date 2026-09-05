"use client";

import { useState } from 'react';
import { initialHabits, Habit } from '@/lib/mockData';
import { SystemWindow } from '@/components/ui/SystemWindow';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);

  const toggleHabit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHabits(habits.map(h => h.id === id ? { ...h, completedToday: !h.completedToday } : h));
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-8 h-full">
      <header className="mb-2">
        <h1 className="font-display text-2xl md:text-3xl tracking-wider mb-2 uppercase">HABIT SYSTEM</h1>
      </header>

      <SystemWindow title="HABIT TRACKER" className="flex-1">
        <div className="flex justify-end mb-4">
          <button className="retro-button">+ NEW HABIT</button>
        </div>

        <div className="flex flex-col gap-6">
          {habits.map(habit => (
            <div key={habit.id} className="flex flex-col gap-2 p-4 border-2 border-sys-line bg-sys-white hover:bg-sys-pale-pink/10 transition-none group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 cursor-pointer" onClick={(e) => toggleHabit(habit.id, e)}>
                  <div className={`w-4 h-4 border-2 border-sys-line flex items-center justify-center ${habit.completedToday ? 'bg-sys-line' : 'bg-sys-white group-hover:bg-sys-pale-pink'}`}>
                    {habit.completedToday && <div className="w-2 h-2 bg-sys-white" />}
                  </div>
                  <span className={`font-mono text-lg ${habit.completedToday ? 'text-sys-line/60' : 'text-sys-line'}`}>{habit.title}</span>
                </div>
                <div className="text-right font-mono text-xs text-sys-line/70 flex flex-col items-end">
                  <span className="uppercase">{habit.frequency}</span>
                  <span>STREAK: <span className="text-sys-line font-bold">{habit.streak}</span> &middot; WEEK: <span className="text-sys-line font-bold">{habit.weeklyCompleted}/{habit.weeklyTarget}</span></span>
                </div>
              </div>
              
              <div className="mt-2 flex gap-1 sm:gap-2 pt-2 border-t-2 border-sys-line/10">
                {DAYS.map((day, i) => {
                  let status = '-';
                  if (i === 4) status = habit.completedToday ? '✓' : '_'; // Today (Friday mock)
                  else if (i < 4) status = (i % 2 === 0 || habit.weeklyTarget > 4) ? '✓' : '_'; // Past days mock

                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <span className="font-mono text-[10px] text-sys-line/50">{day}</span>
                      <div className="font-mono text-base font-bold">
                        {status === '✓' ? (
                          <span className="text-sys-pink">✓</span>
                        ) : status === '_' ? (
                          <span className="text-sys-line/30">_</span>
                        ) : (
                          <span className="text-sys-line/20">-</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </SystemWindow>
    </div>
  );
}
