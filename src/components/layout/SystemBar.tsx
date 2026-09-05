"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'TODAY', href: '/today' },
  { label: 'TASKS', href: '/tasks' },
  { label: 'HABITS', href: '/habits' },
  { label: 'WEEK', href: '/week' },
  { label: 'LOG', href: '/log' },
  { label: 'SLEEP', href: '/sleep' },
  { label: 'FOCUS', href: '/focus' },
  { label: 'SYSTEM', href: '/system' },
];

export function SystemBar() {
  const pathname = usePathname();
  const [time, setTime] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (pathname === '/login') return null;

  return (
    <header className="relative flex-none flex items-center justify-between bg-sys-base text-sys-white border-b-2 border-sys-line px-4 py-2 font-mono text-sm retro-shadow-sm z-50">
      <div className="flex items-center gap-6">
        <Link href="/today" className="font-display text-lg tracking-widest hover:text-sys-pink transition-none" onClick={() => setIsMobileMenuOpen(false)}>
          LIFE_OS
        </Link>
        <button 
          className="md:hidden font-mono text-sys-pink hover:text-sys-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '[X]' : '[MENU]'}
        </button>
        <nav className="hidden md:flex gap-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`px-1 transition-none ${isActive ? 'bg-sys-pink text-sys-base font-bold' : 'hover:text-sys-pink hover:bg-sys-line'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline-block text-sys-pale-pink">{time || '--:--'}</span>
        <div className="w-3 h-3 bg-green-500 border-2 border-sys-line animate-pulse" title="System Status: OK" />
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-[100%] left-0 w-full bg-sys-base border-b-2 border-sys-line p-4 flex flex-col gap-2 md:hidden retro-shadow-sm z-40">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-3 px-4 border-2 border-sys-line font-mono text-center transition-none ${isActive ? 'bg-sys-pink text-sys-base font-bold' : 'hover:bg-sys-white hover:text-sys-base text-sys-white bg-sys-base'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
