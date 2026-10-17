"use client";

import { useLifeOS } from '@/lib/useLifeOS';
import { SystemWindow } from '@/components/ui/SystemWindow';
import { useState, useEffect } from 'react';

export default function SystemScreen() {
  const { state, metrics } = useLifeOS();
  const [uptimeSeconds, setUptimeSeconds] = useState(50531); // ~14h

  useEffect(() => {
    const timer = setInterval(() => setUptimeSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const completedTasks = state.tasks.filter((t) => t.completed).length;
  const completedHabits = state.habits.filter((h) => h.completedToday).length;
  const completedWeekly = state.weeklyChecklist.filter((w) => w.completed).length;
  const weeklyPct = state.weeklyChecklist.length > 0
    ? Math.round((completedWeekly / state.weeklyChecklist.length) * 100)
    : 0;

  const focusH = Math.floor(state.focusSecondsToday / 3600);
  const focusM = Math.floor((state.focusSecondsToday % 3600) / 60);

  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-8 h-full">
      <header className="flex flex-wrap items-end justify-between gap-2 mb-2">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wider mb-1 uppercase">SYSTEM DIAGNOSTICS</h1>
          <p className="font-mono text-xs opacity-80 uppercase tracking-widest">
            CORE INTEGRITY &bull; METRICS TELEMETRY
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SystemWindow title="SYSTEM STATUS — TODAY" className="retro-panel-dark">
          <div className="flex flex-col gap-4 font-mono p-2">
            <div className="flex justify-between items-center border-b border-sys-white/20 pb-2">
              <span className="opacity-70">TASKS</span>
              <span className="text-sys-pink font-bold text-lg">
                {completedTasks.toString().padStart(2, '0')}/{state.tasks.length.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-sys-white/20 pb-2">
              <span className="opacity-70">HABITS</span>
              <span className="text-sys-pink font-bold text-lg">
                {completedHabits.toString().padStart(2, '0')}/{state.habits.length.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-sys-white/20 pb-2">
              <span className="opacity-70">FOCUS</span>
              <span className="text-sys-pink font-bold text-lg">
                {focusH.toString().padStart(2, '0')}h {focusM.toString().padStart(2, '0')}m
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-sys-white/20 pb-2">
              <span className="opacity-70">SLEEP</span>
              <span className="text-sys-pink font-bold text-lg">{state.sleep.total}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="opacity-70">WEEK PROGRESS</span>
              <span className="text-sys-pink font-bold text-xl">{weeklyPct}%</span>
            </div>
          </div>
        </SystemWindow>

        <SystemWindow title="HARDWARE SIMULATION">
          <div className="flex flex-col gap-4 font-mono text-sm p-2">
            <div className="flex justify-between">
              <span>STORAGE ENGINE</span>
              <span className="font-bold text-green-400 bg-sys-line px-1.5 py-0.5 text-xs">LOCAL-PERSISTENT</span>
            </div>
            <div className="flex justify-between">
              <span>OPERATING SYSTEM</span>
              <span className="font-bold">LIFE-OS v1.0</span>
            </div>
            <div className="flex justify-between">
              <span>ACTIVE TASK QUEUE</span>
              <span className="font-bold">{(state.tasks.length - completedTasks).toString().padStart(2, '0')} PENDING</span>
            </div>
            <div className="flex justify-between">
              <span>SESSION UPTIME</span>
              <span className="font-bold font-mono">{formatUptime(uptimeSeconds)}</span>
            </div>

            <div className="mt-4 border-t-2 border-sys-line pt-4">
              <div className="flex justify-between items-end mb-2">
                <span>SYSTEM PERFORMANCE</span>
                <span className="font-bold">{metrics.discipline}%</span>
              </div>
              <div className="w-full h-4 border-2 border-sys-line p-[2px]">
                <div
                  className="h-full bg-sys-line transition-all duration-300"
                  style={{ width: `${Math.max(10, metrics.discipline)}%` }}
                />
              </div>
            </div>
          </div>
        </SystemWindow>
      </div>
    </div>
  );
}
