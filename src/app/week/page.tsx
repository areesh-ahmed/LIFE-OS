"use client";

import { useState } from 'react';
import { useLifeOS } from '@/lib/useLifeOS';
import { SystemWindow } from '@/components/ui/SystemWindow';
import { PixelCheckbox } from '@/components/ui/PixelCheckbox';
import { RetroModal } from '@/components/ui/RetroModal';
import { getCurrentWeekDates } from '@/lib/dateUtils';

export default function WeekScreen() {
  const { state, toggleWeekly, addWeekly, deleteWeekly } = useLifeOS();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');

  const checklist = state.weeklyChecklist;
  const completedCount = checklist.filter((item) => item.completed).length;
  const completionPct = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  const weekDays = getCurrentWeekDates();

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    addWeekly(newItemTitle.trim());
    setNewItemTitle('');
    setIsAddOpen(false);
  };

  // Derive genuine activity per day of current week
  const habits = state.habits;
  const tasks = state.tasks;
  const focusSessions = state.focusSessions;
  const sleepRecords = state.sleepRecords;

  // Check if any activity exists for this week
  const weekDatesSet = new Set(weekDays.map((d) => d.dateStr));
  const hasHabitActivity = habits.some((h) => (h.completedDates || []).some((d) => weekDatesSet.has(d)));
  const hasTaskActivity = tasks.some((t) => t.completed && t.date && weekDatesSet.has(t.date));
  const hasFocusActivity = focusSessions.some((s) => s.date && weekDatesSet.has(s.date));
  const hasSleepActivity = sleepRecords.some((s) => s.date && weekDatesSet.has(s.date));

  const hasAnyWeeklyActivity = hasHabitActivity || hasTaskActivity || hasFocusActivity || hasSleepActivity;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-8 h-full">
      <header className="flex flex-wrap items-end justify-between gap-2 mb-2">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wider mb-1 uppercase">WEEKLY OPERATIONS</h1>
          <p className="font-mono text-xs opacity-80 uppercase tracking-widest">
            {completedCount} OF {checklist.length} TARGET OBJECTIVES ATTAINED
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <SystemWindow title="SYSTEM OVERVIEW">
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[400px]">
              {/* Table header with current week dates */}
              <div className="grid grid-cols-8 gap-2 font-mono text-xs border-b-2 border-sys-line/20 pb-2 mb-3">
                <div className="col-span-1 text-[11px] font-bold opacity-60">SYSTEM</div>
                {weekDays.map((d) => (
                  <div
                    key={d.dateStr}
                    className={`col-span-1 text-center font-mono ${
                      d.isToday ? 'text-sys-pink font-bold' : 'opacity-70'
                    }`}
                  >
                    <div>{d.dayShort}</div>
                    <div className="text-[10px] opacity-70">{d.dayNumber}</div>
                  </div>
                ))}
              </div>

              {/* Real Activity Matrix */}
              {!hasAnyWeeklyActivity && habits.length === 0 ? (
                <div className="p-8 text-center font-mono border border-dashed border-sys-line/30 bg-sys-pale-pink/5 flex flex-col items-center justify-center gap-2">
                  <span className="font-bold text-sys-pink text-xs">[ NO WEEKLY TELEMETRY ]</span>
                  <span className="text-sys-line/70 text-[11px]">
                    LOG TASKS, COMPLETE HABITS, OR TRACK SLEEP TO POPULATE THIS MATRIX.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-3 font-mono">
                  {/* Habit rows */}
                  {habits.map((habit) => {
                    const completedDates = habit.completedDates || [];
                    return (
                      <div
                        key={habit.id}
                        className="grid grid-cols-8 gap-2 items-center hover:bg-sys-pale-pink/20 -mx-2 px-2 py-1"
                      >
                        <div
                          className="col-span-1 text-xs opacity-80 font-bold truncate"
                          title={habit.title}
                        >
                          {habit.title}
                        </div>
                        {weekDays.map((d) => {
                          const isDone = completedDates.includes(d.dateStr);
                          return (
                            <div key={d.dateStr} className="col-span-1 text-center font-bold text-sm">
                              {isDone ? (
                                <span className="text-sys-pink">✓</span>
                              ) : d.isFuture ? (
                                <span className="text-sys-line/20">&middot;</span>
                              ) : (
                                <span className="text-sys-line/30">-</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

                  {/* Tasks completed summary row */}
                  <div className="grid grid-cols-8 gap-2 items-center hover:bg-sys-pale-pink/20 -mx-2 px-2 py-1 border-t border-sys-line/10 pt-2">
                    <div className="col-span-1 text-[11px] opacity-70 font-bold">TASKS</div>
                    {weekDays.map((d) => {
                      const count = tasks.filter((t) => t.completed && t.date === d.dateStr).length;
                      return (
                        <div key={d.dateStr} className="col-span-1 text-center text-xs font-mono">
                          {count > 0 ? (
                            <span className="font-bold text-sys-pink">{count}</span>
                          ) : (
                            <span className="text-sys-line/25">-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Focus minutes summary row */}
                  <div className="grid grid-cols-8 gap-2 items-center hover:bg-sys-pale-pink/20 -mx-2 px-2 py-1">
                    <div className="col-span-1 text-[11px] opacity-70 font-bold">FOCUS</div>
                    {weekDays.map((d) => {
                      const daySeconds = focusSessions
                        .filter((s) => s.date === d.dateStr)
                        .reduce((sum, s) => sum + s.durationSeconds, 0);
                      const mins = Math.round(daySeconds / 60);
                      return (
                        <div key={d.dateStr} className="col-span-1 text-center text-[10px] font-mono">
                          {mins > 0 ? (
                            <span className="font-bold text-sys-line">{mins}m</span>
                          ) : (
                            <span className="text-sys-line/25">-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Sleep summary row */}
                  <div className="grid grid-cols-8 gap-2 items-center hover:bg-sys-pale-pink/20 -mx-2 px-2 py-1">
                    <div className="col-span-1 text-[11px] opacity-70 font-bold">SLEEP</div>
                    {weekDays.map((d) => {
                      const entry = sleepRecords.find((s) => s.date === d.dateStr);
                      const hours = entry ? (entry.durationMinutes / 60).toFixed(1) : null;
                      return (
                        <div key={d.dateStr} className="col-span-1 text-center text-[10px] font-mono">
                          {hours ? (
                            <span className="font-bold text-sys-pink">{hours}h</span>
                          ) : (
                            <span className="text-sys-line/25">-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </SystemWindow>

        <SystemWindow title="WEEKLY CHECKLIST">
          <div className="flex flex-col gap-3 min-h-[220px]">
            {checklist.length === 0 ? (
              <div className="p-8 text-center font-mono border border-dashed border-sys-line/30 bg-sys-pale-pink/5 flex flex-col items-center justify-center gap-2 my-auto">
                <span className="font-bold text-sys-pink text-xs">[ NO WEEKLY OBJECTIVES ]</span>
                <span className="text-sys-line/70 text-xs">
                  DEFINE TARGET OBJECTIVES FOR THE CURRENT OPERATIONAL CYCLE.
                </span>
              </div>
            ) : (
              checklist.map((item) => (
                <div key={item.id} className="flex items-center justify-between group">
                  <PixelCheckbox
                    checked={item.completed}
                    onChange={() => toggleWeekly(item.id)}
                    label={item.title}
                  />
                  <button
                    onClick={() => deleteWeekly(item.id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-sys-pink text-sys-line font-mono text-xs px-1"
                    title="Remove goal"
                  >
                    [×]
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="mt-4 w-full retro-border py-2 text-center font-mono text-xs font-bold hover:bg-sys-pale-pink transition-none active:bg-sys-pink active:text-sys-white"
          >
            + ADD ITEM
          </button>

          <div className="mt-6 pt-4 border-t-2 border-sys-line font-mono">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold">WEEK COMPLETION</span>
              <span className="text-xl font-bold text-sys-pink">{completionPct}%</span>
            </div>
            <div className="w-full h-4 border-2 border-sys-line bg-sys-white p-[2px]">
              <div
                className="h-full bg-sys-line transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </SystemWindow>
      </div>

      {/* Add Weekly Goal Modal */}
      <RetroModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="ADD WEEKLY GOAL"
      >
        <form onSubmit={handleAddItem} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold">GOAL OR MILESTONE</label>
            <input
              type="text"
              required
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="e.g., Ship production v1.2"
              className="retro-border px-3 py-2 bg-sys-white outline-none focus:bg-sys-pale-pink/20"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t-2 border-sys-line mt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="retro-border px-4 py-2 hover:bg-sys-pale-pink/30 font-bold transition-none"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="retro-border px-5 py-2 bg-sys-line text-sys-white hover:bg-sys-pink hover:text-sys-base font-bold transition-none"
            >
              [ + ADD GOAL ]
            </button>
          </div>
        </form>
      </RetroModal>
    </div>
  );
}
