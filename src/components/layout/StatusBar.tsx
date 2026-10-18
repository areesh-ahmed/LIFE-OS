"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLifeOS } from '@/lib/useLifeOS';

export function StatusBar() {
  const [dateStr, setDateStr] = useState('');
  const pathname = usePathname();
  const { state, isLoaded } = useLifeOS();

  useEffect(() => {
    const d = new Date();
    setDateStr(d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }));
  }, []);

  if (pathname === '/login') return null;

  const completedTasks = state.tasks.filter((t) => t.completed).length;
  const totalTasks = state.tasks.length;
  const completedHabits = state.habits.filter((h) => h.completedToday).length;
  const totalHabits = state.habits.length;

  const focusH = Math.floor(state.focusSecondsToday / 3600);
  const focusM = Math.floor((state.focusSecondsToday % 3600) / 60);

  return (
    <footer className="flex-none flex flex-wrap items-center gap-4 md:gap-6 bg-sys-white text-sys-line border-t-2 border-sys-line px-4 py-1.5 font-mono text-xs z-50 retro-shadow-[0_-2px_0_0_#0D0814] mt-auto select-none">
      <span className="font-bold flex items-center gap-2">
        <span className="w-2 h-2 bg-green-500 animate-pulse block border border-sys-line" />
        SYSTEM READY
      </span>
      <span className="hidden sm:inline-block">DATE: {dateStr || '...'}</span>
      <span className="hidden md:inline-block">
        TASKS: {isLoaded ? `${completedTasks.toString().padStart(2, '0')}/${totalTasks.toString().padStart(2, '0')}` : '--/--'}
      </span>
      <span className="hidden md:inline-block">
        HABITS: {isLoaded ? `${completedHabits.toString().padStart(2, '0')}/${totalHabits.toString().padStart(2, '0')}` : '--/--'}
      </span>
      <span className="hidden lg:inline-block">
        SLEEP: {isLoaded ? (state.sleep?.total || '--:--') : '--:--'}
      </span>
      <span className="hidden lg:inline-block">
        FOCUS: {isLoaded ? `${focusH.toString().padStart(2, '0')}:${focusM.toString().padStart(2, '0')}` : '--:--'}
      </span>
      <span className="ml-auto text-sys-pink font-bold">LIFE-OS v1.0</span>
    </footer>
  );
}
