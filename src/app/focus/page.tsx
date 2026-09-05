"use client";

import { useState, useEffect } from 'react';
import { SystemWindow } from '@/components/ui/SystemWindow';

export default function FocusScreen() {
  const [active, setActive] = useState(false);
  const [seconds, setSeconds] = useState(2537); // 00:42:17 in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (active) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [active]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-8 h-full">
      <header className="mb-2">
        <h1 className="font-display text-2xl md:text-3xl tracking-wider mb-2 uppercase">FOCUS SYSTEM</h1>
      </header>

      <SystemWindow title="CURRENT SESSION">
        <div className="flex flex-col items-center justify-center p-8 gap-8">
          <div className="font-mono text-5xl sm:text-6xl md:text-7xl font-bold tracking-widest text-sys-pink text-center">
            {formatTime(seconds)}
          </div>
          
          <div className="font-mono text-sm border-2 border-sys-line px-4 py-2 bg-sys-pale-pink/20 text-center w-full max-w-xs truncate">
            PROJECT: Java Assignment
          </div>

          <div className="flex gap-4 w-full max-w-xs">
            <button 
              className="retro-button flex-1"
              onClick={() => setActive(!active)}
            >
              [ {active ? 'PAUSE' : 'START'} ]
            </button>
            <button className="retro-button flex-1 bg-sys-line text-sys-white hover:bg-sys-line/90">
              [ FINISH ]
            </button>
          </div>
        </div>
      </SystemWindow>

      <SystemWindow title="TODAY'S METRICS">
        <div className="flex justify-around items-center font-mono py-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs opacity-70">FOCUS TIME</span>
            <span className="text-2xl font-bold">03:21</span>
          </div>
          <div className="w-2 h-12 border-l-2 border-sys-line border-dashed" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs opacity-70">SESSIONS</span>
            <span className="text-2xl font-bold">4</span>
          </div>
        </div>
      </SystemWindow>
    </div>
  );
}
