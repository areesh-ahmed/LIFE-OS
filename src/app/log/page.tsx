"use client";

import { useState } from 'react';
import { useLifeOS } from '@/lib/useLifeOS';
import { SystemWindow } from '@/components/ui/SystemWindow';

export default function LogScreen() {
  const { state, addCustomLog } = useLifeOS();
  const [logInput, setLogInput] = useState('');

  const logs = state.activityLogs;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logInput.trim()) return;
    addCustomLog(logInput.trim());
    setLogInput('');
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-8 h-full">
      <header className="flex flex-wrap items-end justify-between gap-2 mb-2">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wider mb-1 uppercase">ACTIVITY LOG</h1>
          <p className="font-mono text-xs opacity-80 uppercase tracking-widest">
            CHRONOLOGICAL SYSTEM AUDIT TRAIL
          </p>
        </div>
      </header>

      <SystemWindow title="SYSTEM TERMINAL" className="flex-1 retro-panel-dark">
        <div className="flex flex-col gap-6 font-mono text-xs sm:text-sm p-2 overflow-y-auto max-h-[500px]">
          {/* Quick Log Command Input */}
          <form onSubmit={handleSubmit} className="flex gap-2 items-center border-b border-sys-white/20 pb-4">
            <span className="text-sys-pink font-bold">&gt;</span>
            <input
              type="text"
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              placeholder="Type activity note and hit Enter (e.g. 'Read Chapter 4 of OS book')..."
              className="bg-transparent text-sys-white placeholder:text-sys-white/40 outline-none w-full font-mono text-xs sm:text-sm"
              autoFocus
            />
            <button
              type="submit"
              className="border border-sys-white/40 hover:bg-sys-pink hover:text-sys-base px-3 py-1 font-mono text-xs shrink-0 transition-none"
            >
              [ LOG ]
            </button>
          </form>

          {logs.map((day) => (
            <div key={day.date} className="flex flex-col gap-2">
              <div className="text-sys-pink font-bold border-b border-sys-white/20 pb-1 uppercase tracking-wider flex justify-between">
                <span>{day.date}</span>
                <span className="text-sys-white/50 text-[11px]">{day.entries.length} EVENTS</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {day.entries.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 sm:gap-4 items-start hover:bg-sys-white/10 px-2 py-1 transition-none"
                  >
                    <span className="opacity-60 w-12 shrink-0 text-xs">{entry.time}</span>
                    <span className="text-sys-pink shrink-0 font-bold">{entry.status}</span>
                    <span className="break-all">{entry.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-2 flex gap-2 items-center text-sys-white/50 animate-pulse text-xs">
            <div className="w-2 h-4 bg-sys-white/50" />
            <span>TERMINAL LISTENING FOR EVENT INPUT...</span>
          </div>
        </div>
      </SystemWindow>
    </div>
  );
}
