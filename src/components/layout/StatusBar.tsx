"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';


export function StatusBar() {
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const d = new Date();
    setDateStr(d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }));
  }, []);

  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <footer className="flex-none flex flex-wrap items-center gap-4 md:gap-6 bg-sys-white text-sys-line border-t-2 border-sys-line px-4 py-1 font-mono text-xs z-50 retro-shadow-[0_-2px_0_0_#0D0814] mt-auto">
      <span className="font-bold flex items-center gap-2">
        <span className="w-2 h-2 bg-sys-black block" />
        SYSTEM READY
      </span>
      <span className="hidden sm:inline-block">DATE: {dateStr}</span>
      <span className="hidden md:inline-block">TASKS: 07/10</span>
      <span className="hidden md:inline-block">HABITS: 05/07</span>
      <span className="hidden lg:inline-block">SLEEP: 07:31</span>
      <span className="hidden lg:inline-block">FOCUS: 02:14</span>
      <span className="ml-auto text-sys-lavender">v1.0</span>
    </footer>
  );
}
