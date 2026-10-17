"use client";

import { useState, useEffect } from 'react';
import { useLifeOS } from '@/lib/useLifeOS';
import { SystemWindow } from '@/components/ui/SystemWindow';

export default function FocusScreen() {
  const { state, finishFocusSession } = useLifeOS();
  const [active, setActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [projectName, setProjectName] = useState('LIFE OS Core Development');
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (active) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [active]);


  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    if (seconds === 0) return;
    setActive(false);
    finishFocusSession(seconds, projectName);
    const loggedMins = Math.max(1, Math.round(seconds / 60));
    setNotification(`[ SESSION LOGGED: +${loggedMins} MINS TO TODAY'S FOCUS ]`);
    setSeconds(0);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleReset = () => {
    setActive(false);
    setSeconds(0);
  };

  const totalFocusSeconds = state.focusSecondsToday + (active ? seconds : 0);
  const focusHours = Math.floor(totalFocusSeconds / 3600);
  const focusMins = Math.floor((totalFocusSeconds % 3600) / 60);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-8 h-full">
      <header className="mb-2">
        <h1 className="font-display text-2xl md:text-3xl tracking-wider mb-1 uppercase">FOCUS SYSTEM</h1>
        <p className="font-mono text-xs opacity-80 uppercase tracking-widest">
          DEEP WORK ENGINE &bull; ACTIVE INTERVAL TRACKER
        </p>
      </header>

      {notification && (
        <div className="bg-sys-line text-sys-pink font-mono text-xs px-4 py-2.5 retro-border border-sys-pink animate-pulse text-center">
          {notification}
        </div>
      )}

      <SystemWindow title="CURRENT SESSION">
        <div className="flex flex-col items-center justify-center p-6 sm:p-8 gap-6">
          <div className="font-mono text-5xl sm:text-6xl md:text-7xl font-bold tracking-widest text-sys-pink text-center select-none">
            {formatTime(seconds)}
          </div>

          <div className="w-full max-w-sm flex items-center gap-2">
            {isEditingProject ? (
              <div className="flex w-full gap-2">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="font-mono text-xs border-2 border-sys-line px-3 py-1.5 bg-sys-white outline-none w-full"
                  autoFocus
                />
                <button
                  onClick={() => setIsEditingProject(false)}
                  className="retro-border px-3 py-1 bg-sys-line text-sys-white font-mono text-xs"
                >
                  SAVE
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingProject(true)}
                className="font-mono text-xs border-2 border-sys-line px-4 py-2 bg-sys-pale-pink/20 text-center w-full truncate cursor-pointer hover:bg-sys-pale-pink/40"
                title="Click to edit project name"
              >
                PROJECT: <span className="font-bold underline">{projectName}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 w-full max-w-sm">
            <button
              className={`retro-button flex-1 py-3 text-sm ${
                active ? 'bg-sys-pink text-sys-white' : ''
              }`}
              onClick={() => setActive(!active)}
            >
              [ {active ? 'PAUSE' : 'START'} ]
            </button>
            <button
              className="retro-button flex-1 py-3 text-sm bg-sys-line text-sys-white hover:bg-sys-pink hover:text-sys-base"
              onClick={handleFinish}
              disabled={seconds === 0}
            >
              [ FINISH ]
            </button>
            <button
              className="retro-border px-3 py-3 font-mono text-xs hover:bg-sys-pale-pink/40"
              onClick={handleReset}
              title="Reset Timer"
            >
              RESET
            </button>
          </div>
        </div>
      </SystemWindow>

      <SystemWindow title="TODAY'S METRICS">
        <div className="flex justify-around items-center font-mono py-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs opacity-70">TOTAL FOCUS TIME</span>
            <span className="text-2xl font-bold text-sys-pink">
              {focusHours.toString().padStart(2, '0')}:{focusMins.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="w-2 h-12 border-l-2 border-sys-line border-dashed" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs opacity-70">SESSIONS LOGGED</span>
            <span className="text-2xl font-bold">{state.focusSessionsCount}</span>
          </div>
        </div>
      </SystemWindow>
    </div>
  );
}
