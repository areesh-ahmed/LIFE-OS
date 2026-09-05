"use client";

import { useState } from 'react';
import { initialTasks, Task } from '@/lib/mockData';
import { SystemWindow } from '@/components/ui/SystemWindow';

type Tab = 'TODAY' | 'UPCOMING' | 'COMPLETED' | 'ALL';
const TABS: Tab[] = ['TODAY', 'UPCOMING', 'COMPLETED', 'ALL'];

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTab, setActiveTab] = useState<Tab>('TODAY');

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const getFilteredTasks = () => {
    switch (activeTab) {
      case 'COMPLETED': return tasks.filter(t => t.completed);
      case 'TODAY': return tasks.filter(t => !t.completed); // Assuming mock data is today's for simplicity
      case 'UPCOMING': return [];
      case 'ALL': default: return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-8 h-full">
      <header className="mb-2">
        <h1 className="font-display text-2xl md:text-3xl tracking-wider mb-2 uppercase">TASK SYSTEM</h1>
      </header>

      <SystemWindow title="OPERATIONS" className="flex-1">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between border-b-2 border-sys-line pb-4 mb-4 gap-4">
          <div className="flex bg-sys-white retro-border text-sm font-mono overflow-x-auto">
            {TABS.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 border-r-2 border-sys-line last:border-r-0 transition-none whitespace-nowrap ${activeTab === tab ? 'bg-sys-line text-sys-white' : 'hover:bg-sys-pale-pink text-sys-line'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-2 font-mono text-xs">
            <button className="retro-border px-3 py-1 hover:bg-sys-pale-pink transition-none">SORT</button>
            <button className="retro-border px-3 py-1 hover:bg-sys-pale-pink transition-none">FILTER</button>
            <button className="retro-border px-3 py-1 bg-sys-line text-sys-white hover:bg-sys-pink hover:text-sys-base transition-none">+ NEW TASK</button>
          </div>
        </div>

        {/* Task List */}
        <div className="flex flex-col gap-0 border-2 border-sys-line bg-sys-white">
          <div className="bg-sys-line text-sys-white font-mono text-xs grid grid-cols-12 gap-4 px-4 py-1">
            <div className="col-span-12 sm:col-span-6">TASK</div>
            <div className="hidden sm:block col-span-2">CATEGORY</div>
            <div className="hidden sm:block col-span-2">TIME</div>
            <div className="hidden sm:block col-span-2 text-right">PRIORITY</div>
          </div>
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center font-mono text-sys-line/50 text-sm bg-sys-white">NO TASKS FOUND FOR THIS VIEW.</div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="grid grid-cols-12 gap-4 px-4 py-3 border-b-2 border-sys-line/20 last:border-0 hover:bg-sys-pale-pink/30 group bg-sys-white">
                <div className="col-span-12 sm:col-span-6 flex items-start gap-3">
                  <div className="relative pt-[2px]">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={task.completed} 
                      onChange={() => toggleTask(task.id)}
                    />
                    <div 
                      onClick={() => toggleTask(task.id)}
                      className={`w-4 h-4 border-2 border-sys-line cursor-pointer flex items-center justify-center ${task.completed ? 'bg-sys-line' : 'bg-sys-white group-hover:bg-sys-pale-pink'}`}
                    >
                      {task.completed && <div className="w-2 h-2 bg-sys-white" />}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-mono text-sm leading-tight ${task.completed ? 'text-sys-line/50 line-through decoration-sys-line/30' : 'text-sys-line'}`}>
                      {task.title}
                    </span>
                    {/* Mobile details visible only on small screens */}
                    <span className="sm:hidden font-mono text-xs text-sys-line/60 mt-1">
                      {task.category} &middot; {task.time || '--:--'} &middot; {task.priority}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex col-span-2 items-center font-mono text-xs text-sys-line/70">
                  {task.category}
                </div>
                <div className="hidden sm:flex col-span-2 items-center font-mono text-xs text-sys-line/70">
                  {task.time || '--:--'}
                </div>
                <div className="hidden sm:flex col-span-2 items-center justify-end font-mono text-xs text-sys-line/70">
                  {task.priority === 'HIGH' && <span className="text-sys-pink font-bold">{task.priority}</span>}
                  {task.priority !== 'HIGH' && task.priority}
                </div>
              </div>
            ))
          )}
        </div>
      </SystemWindow>
    </div>
  );
}
