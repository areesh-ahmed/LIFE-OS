"use client";

import { useState } from 'react';
import { useLifeOS } from '@/lib/useLifeOS';
import { SystemWindow } from '@/components/ui/SystemWindow';
import { RetroModal } from '@/components/ui/RetroModal';
import { SleepQuality } from '@/lib/types';
import {
  getCurrentWeekDates,
  getTodayDateString,
  getYesterdayDateString,
  calculateSleepDuration,
  formatMinutes,
} from '@/lib/dateUtils';

export default function SleepScreen() {
  const { state, logSleep, deleteSleep } = useLifeOS();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  // Form state
  const [logDate, setLogDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [targetDuration, setTargetDuration] = useState('8h 00m');
  const [quality, setQuality] = useState<SleepQuality>('GOOD');
  const [notes, setNotes] = useState('');

  const records = state.sleepRecords || [];
  const latestSleep = state.sleep;
  const weekDays = getCurrentWeekDates();

  // Calculate live duration preview in modal
  const previewDuration = calculateSleepDuration(startTime, wakeTime);

  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !wakeTime) return;

    logSleep({
      date: logDate || todayStr,
      start: startTime,
      wake: wakeTime,
      targetFormatted: targetDuration,
      status: quality,
      notes: notes.trim() || undefined,
    });

    setIsLogModalOpen(false);
    setNotes('');
  };

  // Calculate weekly stats strictly from recorded entries falling in current week
  const weekDatesSet = new Set(weekDays.map((d) => d.dateStr));
  const weeklyRecordedLogs = records.filter((r) => weekDatesSet.has(r.date));

  const totalWeeklyMinutes = weeklyRecordedLogs.reduce((sum, r) => sum + r.durationMinutes, 0);
  const averageWeeklyMinutes =
    weeklyRecordedLogs.length > 0 ? Math.round(totalWeeklyMinutes / weeklyRecordedLogs.length) : 0;
  const averageWeeklyFormatted = formatMinutes(averageWeeklyMinutes);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-8 h-full">
      <header className="flex flex-wrap items-end justify-between gap-2 mb-2">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wider mb-1 uppercase">SLEEP LOG</h1>
          <p className="font-mono text-xs opacity-80 uppercase tracking-widest">
            CIRCADIAN RECOVERY &bull; BIOMETRIC MONITORING
          </p>
        </div>
        <button
          onClick={() => setIsLogModalOpen(true)}
          className="retro-border px-3 py-1.5 bg-sys-line text-sys-white hover:bg-sys-pink hover:text-sys-base font-mono text-xs font-bold transition-none"
        >
          + LOG SLEEP
        </button>
      </header>

      {records.length === 0 ? (
        <SystemWindow title="RECOVERY INSTRUMENT">
          <div className="p-12 text-center font-mono border-2 border-dashed border-sys-line/30 bg-sys-pale-pink/5 flex flex-col items-center justify-center gap-3">
            <span className="font-bold text-sys-pink text-base">[ NO SLEEP RECORDS FOUND ]</span>
            <p className="text-sys-line/70 text-xs max-w-md">
              LOG YOUR SLEEP PROTOCOL TO INITIALIZE CIRCADIAN METRICS, RECOVERY RATINGS, AND SYSTEM HEALTH TELEMETRY.
            </p>
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="mt-2 retro-border px-6 py-2.5 bg-sys-line text-sys-white hover:bg-sys-pink hover:text-sys-base font-mono text-xs font-bold transition-none"
            >
              [ + LOG LAST NIGHT&apos;S SLEEP ]
            </button>
          </div>
        </SystemWindow>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LATEST SLEEP RECORD */}
            <SystemWindow title="LATEST RECORD">
              <div className="flex flex-col gap-4 font-mono">
                {latestSleep ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 border-b-2 border-sys-line/20 pb-4">
                      <div>
                        <div className="text-xs opacity-70 mb-1">BEDTIME</div>
                        <div className="text-2xl font-bold">{latestSleep.start}</div>
                      </div>
                      <div>
                        <div className="text-xs opacity-70 mb-1">WAKE TIME</div>
                        <div className="text-2xl font-bold">{latestSleep.wake}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="opacity-70 text-sm">TOTAL SLEEP</span>
                      <span className="text-3xl font-bold text-sys-pink">{latestSleep.total}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-sys-line/10 text-xs">
                      <span className="opacity-70">TARGET: {latestSleep.target}</span>
                      <span>
                        QUALITY: <span className="font-bold text-sys-pink">[{latestSleep.status}]</span>
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 opacity-60">NO RECORD AVAILABLE</div>
                )}
              </div>
            </SystemWindow>

            {/* WEEKLY RECOVERY OVERVIEW */}
            <SystemWindow title="WEEKLY OVERVIEW">
              <div className="flex flex-col gap-4 font-mono h-full justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="opacity-70 text-xs">WEEKLY AVERAGE</span>
                  <span className="text-xl font-bold text-sys-pink">
                    {weeklyRecordedLogs.length > 0 ? averageWeeklyFormatted : '--:--'}
                  </span>
                </div>

                {/* Real weekly bar chart */}
                <div className="flex items-end justify-between h-36 pt-4 border-t-2 border-sys-line/20 gap-2">
                  {weekDays.map((day) => {
                    const record = records.find((r) => r.date === day.dateStr);
                    const hours = record ? record.durationMinutes / 60 : 0;
                    // Max height scale: 10 hours
                    const heightPercent = Math.min(100, Math.round((hours / 10) * 100));

                    return (
                      <div key={day.dateStr} className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
                        <span className="text-[10px] opacity-70 hidden sm:inline-block">
                          {record ? `${hours.toFixed(1)}h` : '-'}
                        </span>
                        <div
                          className={`w-full relative transition-all duration-300 ${
                            record ? (day.isToday ? 'bg-sys-pink' : 'bg-sys-line') : 'bg-sys-line/10'
                          }`}
                          style={{ height: record ? `${Math.max(12, heightPercent)}%` : '4px' }}
                          title={`${day.dayShort} ${day.monthShort} ${day.dayNumber}: ${
                            record ? record.durationFormatted : 'No sleep logged'
                          }`}
                        >
                          {record && <div className="absolute top-0 w-full h-[2px] bg-sys-white opacity-50" />}
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            day.isToday ? 'text-sys-pink' : 'text-sys-line/70'
                          }`}
                        >
                          {day.dayLetter}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </SystemWindow>
          </div>

          {/* SLEEP HISTORY TABLE */}
          <SystemWindow title="RECOVERY LOG HISTORY">
            <div className="flex flex-col gap-0 border-2 border-sys-line bg-sys-white font-mono text-xs">
              <div className="bg-sys-line text-sys-white grid grid-cols-12 gap-2 px-4 py-1.5 select-none font-bold">
                <div className="col-span-3">DATE</div>
                <div className="col-span-3">BEDTIME &rarr; WAKE</div>
                <div className="col-span-3">DURATION</div>
                <div className="col-span-3 text-right">QUALITY / ACTIONS</div>
              </div>

              {records.map((entry) => (
                <div
                  key={entry.id}
                  className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-sys-line/20 last:border-0 hover:bg-sys-pale-pink/20 items-center group"
                >
                  <div className="col-span-3 font-bold">
                    {entry.date === todayStr ? 'TODAY' : entry.date === yesterdayStr ? 'YESTERDAY' : entry.date}
                  </div>
                  <div className="col-span-3 opacity-80">
                    {entry.start} &rarr; {entry.wake}
                  </div>
                  <div className="col-span-3 font-bold text-sys-pink">{entry.durationFormatted}</div>
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <span
                      className={`px-1.5 py-0.5 border text-[10px] font-bold ${
                        entry.status === 'GOOD'
                          ? 'border-green-600 text-green-700 bg-green-50'
                          : entry.status === 'FAIR'
                          ? 'border-amber-600 text-amber-700 bg-amber-50'
                          : 'border-red-600 text-red-700 bg-red-50'
                      }`}
                    >
                      {entry.status}
                    </span>
                    <button
                      onClick={() => deleteSleep(entry.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-sys-pink text-sys-line px-1"
                      title="Purge record"
                    >
                      [×]
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SystemWindow>
        </>
      )}

      {/* Log Sleep Modal */}
      <RetroModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="RECORD SLEEP PROTOCOL"
      >
        <form onSubmit={handleSaveSleep} className="flex flex-col gap-4 font-mono text-xs">
          <div className="flex flex-col gap-1">
            <label className="font-bold">SLEEP RECORD DATE</label>
            <input
              type="date"
              required
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="retro-border px-3 py-2 bg-sys-white outline-none focus:bg-sys-pale-pink/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold">BEDTIME (START)</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="retro-border px-2 py-2 bg-sys-white outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold">WAKE TIME</label>
              <input
                type="time"
                required
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="retro-border px-2 py-2 bg-sys-white outline-none"
              />
            </div>
          </div>

          {/* Live Duration Calculation */}
          <div className="p-2.5 border border-sys-line/30 bg-sys-pale-pink/20 flex justify-between items-center">
            <span className="opacity-80">CALCULATED SLEEP:</span>
            <span className="font-bold text-sys-pink text-sm">{previewDuration.formatted}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold">QUALITY / RECOVERY</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as SleepQuality)}
                className="retro-border px-2 py-2 bg-sys-white outline-none"
              >
                <option value="GOOD">GOOD (High)</option>
                <option value="FAIR">FAIR (Moderate)</option>
                <option value="POOR">POOR (Low)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold">TARGET DURATION</label>
              <input
                type="text"
                value={targetDuration}
                onChange={(e) => setTargetDuration(e.target.value)}
                placeholder="e.g. 8h 00m"
                className="retro-border px-2 py-2 bg-sys-white outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold">OPTIONAL NOTES</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Deep REM sleep, woke refreshed"
              className="retro-border px-3 py-2 bg-sys-white outline-none focus:bg-sys-pale-pink/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t-2 border-sys-line mt-2">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(false)}
              className="retro-border px-4 py-2 hover:bg-sys-pale-pink/30 font-bold transition-none"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="retro-border px-5 py-2 bg-sys-line text-sys-white hover:bg-sys-pink hover:text-sys-base font-bold transition-none"
            >
              [ + SAVE RECORD ]
            </button>
          </div>
        </form>
      </RetroModal>
    </div>
  );
}
