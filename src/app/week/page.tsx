"use client";

import { useState } from 'react';
import { SystemWindow } from '@/components/ui/SystemWindow';
import { PixelCheckbox } from '@/components/ui/PixelCheckbox';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const SYSTEMS = ['STUDY', 'WORKOUT', 'READING', 'SLEEP'];

const WEEK_DATA = [
  ['✓', '✓', '✓', '×', '✓', '-', '-'],
  ['✓', '×', '✓', '✓', '✓', '-', '-'],
  ['✓', '✓', '✓', '✓', '×', '-', '-'],
  ['✓', '×', '✓', '✓', '✓', '-', '-'],
];

const INITIAL_CHECKLIST = [
  { id: '1', title: 'Finish Java assignment', completed: false },
  { id: '2', title: 'Workout 4 times', completed: false },
  { id: '3', title: 'Read 100 pages', completed: false },
  { id: '4', title: 'Complete project milestone', completed: false },
  { id: '5', title: 'Sleep before 12 AM', completed: false },
];

export default function WeekScreen() {
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);

  const toggleItem = (id: string) => {
    setChecklist(checklist.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-8 h-full">
      <header className="mb-2">
        <h1 className="font-display text-2xl md:text-3xl tracking-wider mb-2 uppercase">WEEKLY OPERATIONS</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <SystemWindow title="SYSTEM OVERVIEW">
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[400px]">
              <div className="grid grid-cols-8 gap-2 font-mono text-xs border-b-2 border-sys-line/20 pb-2 mb-3">
                <div className="col-span-1"></div>
                {DAYS.map(d => (
                  <div key={d} className="col-span-1 text-center opacity-70">{d}</div>
                ))}
              </div>
              
              <div className="flex flex-col gap-4 font-mono">
                {SYSTEMS.map((sys, idx) => (
                  <div key={sys} className="grid grid-cols-8 gap-2 items-center hover:bg-sys-pale-pink/20 -mx-2 px-2 py-1">
                    <div className="col-span-1 text-xs opacity-70">{sys}</div>
                    {WEEK_DATA[idx].map((status, i) => (
                      <div key={i} className="col-span-1 text-center font-bold text-lg">
                        {status === '✓' ? <span className="text-sys-pink">✓</span> : 
                         status === '×' ? <span className="text-sys-line">×</span> : 
                         <span className="text-sys-line/20">-</span>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SystemWindow>

        <SystemWindow title="WEEKLY CHECKLIST">
          <div className="flex flex-col gap-4">
            {checklist.map(item => (
              <PixelCheckbox 
                key={item.id}
                checked={item.completed} 
                onChange={() => toggleItem(item.id)} 
                label={item.title}
              />
            ))}
            <button className="mt-2 w-full retro-border py-2 text-center font-mono text-xs hover:bg-sys-pale-pink transition-none active:bg-sys-pink">
              + ADD ITEM
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t-2 border-sys-line font-mono">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold">WEEK COMPLETION</span>
              <span className="text-xl font-bold">78%</span>
            </div>
            <div className="w-full h-4 border-2 border-sys-line bg-sys-white p-[2px]">
              <div className="h-full bg-sys-line" style={{ width: '78%' }} />
            </div>
          </div>
        </SystemWindow>
      </div>
    </div>
  );
}
