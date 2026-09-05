"use client";

import { useState } from 'react';
import { initialTasks, initialHabits, mockSleep, mockMetrics, Task, Habit } from '@/lib/mockData';
import { PixelCheckbox } from '@/components/ui/PixelCheckbox';
import { SystemWindow } from '@/components/ui/SystemWindow';

export default function TodayScreen() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [habits, setHabits] = useState<Habit[]>(initialHabits);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => h.id === id ? { ...h, completedToday: !h.completedToday } : h));
  };

  const completedHabits = habits.filter(h => h.completedToday).length;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-8">
      <header className="mb-4">
        <h1 className="font-display text-2xl md:text-3xl tracking-wider mb-2">TODAY</h1>
        <p className="font-mono text-sm opacity-80 uppercase">FRIDAY 04 SEPTEMBER 2026</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SECTION 1 - DAILY TASKS */}
        <SystemWindow title="DAILY TASKS" className="lg:col-span-8">
          <div className="flex flex-col gap-4">
            {tasks.map(task => (
              <div key={task.id} className="border-b-2 border-sys-line/10 pb-4 last:border-0 last:pb-0">
                <PixelCheckbox 
                  checked={task.completed} 
                  onChange={() => toggleTask(task.id)} 
                  label={task.title}
                  time={task.time}
                />
              </div>
            ))}
          </div>
          <button className="mt-6 w-full retro-border py-2 text-center font-mono text-xs hover:bg-sys-pale-pink transition-none active:bg-sys-pink">
            + ADD TASK
          </button>
        </SystemWindow>

        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* SECTION 2 - HABITS */}
          <SystemWindow title="HABITS">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {habits.map(habit => (
                <PixelCheckbox 
                  key={habit.id}
                  checked={habit.completedToday} 
                  onChange={() => toggleHabit(habit.id)} 
                  label={habit.title}
                />
              ))}
            </div>
            <div className="mt-6 pt-4 border-t-2 border-sys-line font-mono text-xs flex justify-between items-center">
              <span>{completedHabits} / {habits.length} COMPLETE</span>
              <div className="flex gap-1">
                {habits.map((h, i) => (
                  <div key={i} className={`w-2 h-4 border border-sys-line ${i < completedHabits ? 'bg-sys-line' : 'bg-transparent'}`} />
                ))}
              </div>
            </div>
          </SystemWindow>

          {/* SECTION 3 - SYSTEM STATUS */}
          <SystemWindow title="SYSTEM STATUS">
            <div className="grid grid-cols-2 gap-y-6 gap-x-2 font-mono text-xs">
              <div className="flex flex-col gap-1">
                <span className="opacity-70">FOCUS</span>
                <span className="text-xl font-bold">{mockMetrics.focus}%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="opacity-70">ENERGY</span>
                <span className="text-xl font-bold">{mockMetrics.energy}%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="opacity-70">DISCIPLINE</span>
                <span className="text-xl font-bold">{mockMetrics.discipline}%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="opacity-70">RECOVERY</span>
                <span className="text-xl font-bold">{mockMetrics.recovery}%</span>
              </div>
            </div>
          </SystemWindow>

          {/* SECTION 4 - SLEEP */}
          <SystemWindow title="SLEEP">
            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="opacity-70">LAST NIGHT</span>
                <span>{mockSleep.start} &rarr; {mockSleep.wake}</span>
              </div>
              <div className="flex justify-between items-end border-b-2 border-sys-line/20 pb-2">
                <span className="text-xl font-bold">{mockSleep.total}</span>
                <span className="opacity-70 mb-1">TOTAL</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="opacity-70">TARGET {mockSleep.target}</span>
                <span>STATUS: <span className="text-green-600 font-bold">{mockSleep.status}</span></span>
              </div>
            </div>
          </SystemWindow>
        </div>
      </div>
    </div>
  );
}
