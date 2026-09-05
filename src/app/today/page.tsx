"use client";

import { useState, useEffect } from 'react';
import { todayApi } from '@/lib/api';
import { PixelCheckbox } from '@/components/ui/PixelCheckbox';
import { SystemWindow } from '@/components/ui/SystemWindow';

interface TaskData {
  id: string;
  title: string;
  status: string;
  scheduledAt?: string | null;
}

interface HabitData {
  id: string;
  title: string;
  completedToday: boolean;
}

export default function TodayScreen() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const res = await todayApi.getToday();
        setData(res);
      } catch (err) {
        console.error('Failed to load today data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchToday();
  }, []);

  if (loading) {
    return <div className="p-8 font-mono text-purple-400 animate-pulse">[ LOADING TODAY SYSTEM ]</div>;
  }

  if (!data) {
    return <div className="p-8 font-mono text-red-500">Failed to load system data.</div>;
  }

  const tasks = data.tasks as TaskData[];
  const habits = data.habits as HabitData[];
  const systemStatus = data.systemStatus as Record<string, number>;
  const sleep = data.sleep as Record<string, any> | null;
  const date = data.date as string;

  const completedHabits = habits.filter(h => h.completedToday).length;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-8">
      <header className="mb-4">
        <h1 className="font-display text-2xl md:text-3xl tracking-wider mb-2">TODAY</h1>
        <p className="font-mono text-sm opacity-80 uppercase">{new Date(date).toDateString()}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SECTION 1 - DAILY TASKS */}
        <SystemWindow title="DAILY TASKS" className="lg:col-span-8">
          <div className="flex flex-col gap-4">
            {tasks.map(task => (
              <div key={task.id} className="border-b-2 border-sys-line/10 pb-4 last:border-0 last:pb-0">
                <PixelCheckbox 
                  checked={task.status === 'COMPLETED'} 
                  onChange={() => {}} 
                  label={task.title}
                  time={task.scheduledAt ? new Date(task.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : undefined}
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
                  onChange={() => {}} 
                  label={habit.title}
                />
              ))}
            </div>
            <div className="mt-6 pt-4 border-t-2 border-sys-line font-mono text-xs flex justify-between items-center">
              <span>{completedHabits} / {habits.length} COMPLETE</span>
              <div className="flex gap-1">
                {habits.map((_, i) => (
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
                <span className="text-xl font-bold">{systemStatus?.focus || 0}%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="opacity-70">ENERGY</span>
                <span className="text-xl font-bold">{systemStatus?.energy || 0}%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="opacity-70">DISCIPLINE</span>
                <span className="text-xl font-bold">{systemStatus?.discipline || 0}%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="opacity-70">RECOVERY</span>
                <span className="text-xl font-bold">{systemStatus?.recovery || 0}%</span>
              </div>
            </div>
          </SystemWindow>

          {/* SECTION 4 - SLEEP */}
          <SystemWindow title="SLEEP">
            <div className="flex flex-col gap-3 font-mono text-xs">
              {sleep ? (
                <>
                  <div className="flex justify-between">
                    <span className="opacity-70">LAST NIGHT</span>
                    <span>{new Date(sleep.sleepStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} &rarr; {new Date(sleep.wakeTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="flex justify-between items-end border-b-2 border-sys-line/20 pb-2">
                    <span className="text-xl font-bold">{Math.floor(sleep.durationMinutes / 60)}h {sleep.durationMinutes % 60}m</span>
                    <span className="opacity-70 mb-1">TOTAL</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="opacity-70">TARGET {Math.floor(sleep.targetMinutes / 60)}h {sleep.targetMinutes % 60}m</span>
                    <span>STATUS: <span className="text-green-600 font-bold">{sleep.status}</span></span>
                  </div>
                </>
              ) : (
                <div className="text-center opacity-70">NO DATA</div>
              )}
            </div>
          </SystemWindow>
        </div>
      </div>
    </div>
  );
}
