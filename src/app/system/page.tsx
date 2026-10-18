"use client";

import { useLifeOS } from '@/lib/useLifeOS';
import { SystemWindow } from '@/components/ui/SystemWindow';
import { useState, useEffect, useRef } from 'react';
import { STORAGE_KEY_V2 } from '@/lib/storage';

export default function SystemScreen() {
  const { state, metrics, resetData, loadDemoData, importData } = useLifeOS();
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const [storageBytes, setStorageBytes] = useState(0);
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track session uptime from when user opened the app
  useEffect(() => {
    let sessionStart = sessionStorage.getItem('life_os_session_start');
    if (!sessionStart) {
      sessionStart = Date.now().toString();
      sessionStorage.setItem('life_os_session_start', sessionStart);
    }

    const startTimestamp = parseInt(sessionStart, 10);
    const updateUptime = () => {
      const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
      setUptimeSeconds(Math.max(0, elapsed));
    };

    updateUptime();
    const timer = setInterval(updateUptime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate actual storage size in localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_V2);
      if (raw) {
        setStorageBytes(new Blob([raw]).size);
      } else {
        setStorageBytes(0);
      }
    } catch {
      setStorageBytes(0);
    }
  }, [state]);

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

  const handleExport = () => {
    try {
      const jsonStr = JSON.stringify(state, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `life-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSystemMessage('[ BACKUP EXPORTED SUCCESSFULLY ]');
      setTimeout(() => setSystemMessage(null), 3000);
    } catch {
      setSystemMessage('[ EXPORT FAILED ]');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          importData(parsed);
          setSystemMessage('[ BACKUP RESTORED SUCCESSFULLY ]');
          setTimeout(() => setSystemMessage(null), 3000);
        }
      } catch {
        alert('Invalid JSON file format. Failed to import.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset LIFE-OS? All personal records will be wiped back to a fresh state.')) {
      resetData();
      setSystemMessage('[ STORAGE PURGED & RESET COMPLETED ]');
      setTimeout(() => setSystemMessage(null), 3000);
    }
  };

  const handleLoadDemo = () => {
    if (confirm('Load demo fixtures into LIFE-OS? This will populate the system with demonstration tasks, habits, and telemetry.')) {
      loadDemoData();
      setSystemMessage('[ DEMO FIXTURES LOADED ]');
      setTimeout(() => setSystemMessage(null), 3000);
    }
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

      {systemMessage && (
        <div className="bg-sys-line text-sys-pink font-mono text-xs px-4 py-2 border border-sys-pink animate-pulse text-center">
          {systemMessage}
        </div>
      )}

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
              <span className="text-sys-pink font-bold text-lg">
                {state.sleep ? state.sleep.total : '--:--'}
              </span>
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
              <span>STORAGE FOOTPRINT</span>
              <span className="font-bold">{(storageBytes / 1024).toFixed(2)} KB</span>
            </div>
            <div className="flex justify-between">
              <span>OPERATING SYSTEM</span>
              <span className="font-bold">LIFE-OS v2.0 (Clean First-Run)</span>
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
                <span className="font-bold">
                  {metrics.isRated ? `${metrics.discipline}%` : 'AWAITING DATA'}
                </span>
              </div>
              <div className="w-full h-4 border-2 border-sys-line p-[2px]">
                <div
                  className="h-full bg-sys-line transition-all duration-300"
                  style={{ width: `${metrics.isRated ? Math.max(5, metrics.discipline) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </SystemWindow>
      </div>

      {/* SYSTEM CONTROLS & DATA MANAGEMENT */}
      <SystemWindow title="SYSTEM OPERATIONS &amp; STORAGE MANAGEMENT">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          <button
            onClick={handleExport}
            className="retro-border p-3 hover:bg-sys-pale-pink font-bold transition-none text-center"
          >
            [ EXPORT BACKUP (JSON) ]
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="retro-border p-3 hover:bg-sys-pale-pink font-bold transition-none text-center"
          >
            [ IMPORT BACKUP (JSON) ]
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={handleLoadDemo}
            className="retro-border p-3 hover:bg-sys-pale-pink font-bold transition-none text-center"
            title="Load demonstration tasks, habits, and telemetry"
          >
            [ LOAD DEMO FIXTURES ]
          </button>

          <button
            onClick={handleReset}
            className="retro-border p-3 bg-red-100 hover:bg-red-200 text-red-900 border-red-900 font-bold transition-none text-center"
            title="Purge all local storage"
          >
            [ PURGE &amp; RESET DATA ]
          </button>
        </div>
      </SystemWindow>
    </div>
  );
}
