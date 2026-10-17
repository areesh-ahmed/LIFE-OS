"use client";

import { useState } from 'react';
import { useLifeOS } from '@/lib/useLifeOS';
import { SystemWindow } from '@/components/ui/SystemWindow';
import { PixelCheckbox } from '@/components/ui/PixelCheckbox';
import { RetroModal } from '@/components/ui/RetroModal';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const SYSTEMS = ['STUDY', 'WORKOUT', 'READING', 'SLEEP'];

const WEEK_DATA = [
  ['✓', '✓', '✓', '×', '✓', '-', '-'],
  ['✓', '×', '✓', '✓', '✓', '-', '-'],
  ['✓', '✓', '✓', '✓', '×', '-', '-'],
  ['✓', '×', '✓', '✓', '✓', '-', '-'],
];

export default function WeekScreen() {
  const { state, toggleWeekly, addWeekly } = useLifeOS();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');

  const checklist = state.weeklyChecklist;
  const completedCount = checklist.filter((item) => item.completed).length;
  const completionPct = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    addWeekly(newItemTitle.trim());
    setNewItemTitle('');
    setIsAddOpen(false);
  };

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
              <div className="grid grid-cols-8 gap-2 font-mono text-xs border-b-2 border-sys-line/20 pb-2 mb-3">
                <div className="col-span-1"></div>
                {DAYS.map((d) => (
                  <div key={d} className="col-span-1 text-center opacity-70">
                    {d}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 font-mono">
                {SYSTEMS.map((sys, idx) => (
                  <div
                    key={sys}
                    className="grid grid-cols-8 gap-2 items-center hover:bg-sys-pale-pink/20 -mx-2 px-2 py-1"
                  >
                    <div className="col-span-1 text-xs opacity-70 font-bold">{sys}</div>
                    {WEEK_DATA[idx].map((status, i) => (
                      <div key={i} className="col-span-1 text-center font-bold text-lg">
                        {status === '✓' ? (
                          <span className="text-sys-pink">✓</span>
                        ) : status === '×' ? (
                          <span className="text-sys-line">×</span>
                        ) : (
                          <span className="text-sys-line/20">-</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SystemWindow>

        <SystemWindow title="WEEKLY CHECKLIST">
          <div className="flex flex-col gap-3 min-h-[220px]">
            {checklist.map((item) => (
              <PixelCheckbox
                key={item.id}
                checked={item.completed}
                onChange={() => toggleWeekly(item.id)}
                label={item.title}
              />
            ))}
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
