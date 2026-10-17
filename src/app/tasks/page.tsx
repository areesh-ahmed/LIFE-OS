"use client";

import { useState } from 'react';
import { useLifeOS } from '@/lib/useLifeOS';
import { SystemWindow } from '@/components/ui/SystemWindow';
import { RetroModal } from '@/components/ui/RetroModal';

type Tab = 'TODAY' | 'UPCOMING' | 'COMPLETED' | 'ALL';
const TABS: Tab[] = ['TODAY', 'UPCOMING', 'COMPLETED', 'ALL'];
const CATEGORIES = ['ALL', 'STUDY', 'WORK', 'HEALTH', 'GROWTH', 'SYSTEM'];
const SORT_MODES = ['DEFAULT', 'PRIORITY', 'TIME', 'TITLE'];

export default function TasksScreen() {
  const { state, toggleTask, addTask, deleteTask } = useLifeOS();
  const [activeTab, setActiveTab] = useState<Tab>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortIndex, setSortIndex] = useState(0);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('STUDY');
  const [newPriority, setNewPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [newTime, setNewTime] = useState('');

  const tasks = state.tasks;

  const cycleSort = () => {
    setSortIndex((prev) => (prev + 1) % SORT_MODES.length);
  };

  const cycleFilter = () => {
    const nextIdx = (CATEGORIES.indexOf(categoryFilter) + 1) % CATEGORIES.length;
    setCategoryFilter(CATEGORIES[nextIdx]);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle.trim(), newCategory, newPriority, newTime || undefined);
    setNewTitle('');
    setNewTime('');
    setIsNewTaskOpen(false);
  };

  // Filter logic
  let filteredTasks = tasks.filter((task) => {
    if (activeTab === 'COMPLETED') return task.completed;
    if (activeTab === 'TODAY') return !task.completed;
    if (activeTab === 'UPCOMING') return !task.completed && (task.time || task.priority === 'HIGH');
    return true; // 'ALL'
  });

  if (categoryFilter !== 'ALL') {
    filteredTasks = filteredTasks.filter((t) => t.category.toUpperCase() === categoryFilter);
  }

  // Sort logic
  const currentSort = SORT_MODES[sortIndex];
  filteredTasks = [...filteredTasks].sort((a, b) => {
    if (currentSort === 'PRIORITY') {
      const pWeights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
    }
    if (currentSort === 'TIME') {
      return (a.time || '99:99').localeCompare(b.time || '99:99');
    }
    if (currentSort === 'TITLE') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-8 h-full">
      <header className="flex flex-wrap items-end justify-between gap-2 mb-2">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wider mb-1 uppercase">TASK SYSTEM</h1>
          <p className="font-mono text-xs opacity-80 uppercase tracking-widest">
            {tasks.filter((t) => t.completed).length} OF {tasks.length} OPERATIONS RESOLVED
          </p>
        </div>
      </header>

      <SystemWindow title="OPERATIONS" className="flex-1">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between border-b-2 border-sys-line pb-4 mb-4 gap-4">
          <div className="flex bg-sys-white retro-border text-sm font-mono overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 border-r-2 border-sys-line last:border-r-0 transition-none whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-sys-line text-sys-white font-bold'
                    : 'hover:bg-sys-pale-pink text-sys-line'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 font-mono text-xs">
            <button
              onClick={cycleSort}
              className="retro-border px-3 py-1 hover:bg-sys-pale-pink transition-none flex items-center gap-1.5"
            >
              <span>SORT:</span>
              <span className="font-bold text-sys-pink">{currentSort}</span>
            </button>
            <button
              onClick={cycleFilter}
              className="retro-border px-3 py-1 hover:bg-sys-pale-pink transition-none flex items-center gap-1.5"
            >
              <span>FILTER:</span>
              <span className="font-bold text-sys-pink">{categoryFilter}</span>
            </button>
            <button
              onClick={() => setIsNewTaskOpen(true)}
              className="retro-border px-3 py-1 bg-sys-line text-sys-white hover:bg-sys-pink hover:text-sys-base font-bold transition-none"
            >
              + NEW TASK
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="flex flex-col gap-0 border-2 border-sys-line bg-sys-white">
          <div className="bg-sys-line text-sys-white font-mono text-xs grid grid-cols-12 gap-4 px-4 py-1.5 select-none">
            <div className="col-span-12 sm:col-span-6">TASK</div>
            <div className="hidden sm:block col-span-2">CATEGORY</div>
            <div className="hidden sm:block col-span-2">TIME</div>
            <div className="hidden sm:block col-span-2 text-right">PRIORITY / ACTIONS</div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center font-mono text-sys-line/50 text-sm bg-sys-white">
              NO TASKS MATCH THE CURRENT FILTER OR TAB.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 border-b-2 border-sys-line/20 last:border-0 hover:bg-sys-pale-pink/25 group bg-sys-white items-center transition-none"
              >
                <div className="col-span-12 sm:col-span-6 flex items-start gap-3">
                  <div className="relative pt-[2px]">
                    <div
                      onClick={() => toggleTask(task.id)}
                      className={`w-4 h-4 border-2 border-sys-line cursor-pointer flex items-center justify-center transition-none ${
                        task.completed ? 'bg-sys-line' : 'bg-sys-white group-hover:bg-sys-pale-pink'
                      }`}
                    >
                      {task.completed && <div className="w-2 h-2 bg-sys-white" />}
                    </div>
                  </div>
                  <div className="flex flex-col flex-1">
                    <span
                      onClick={() => toggleTask(task.id)}
                      className={`font-mono text-sm leading-tight cursor-pointer ${
                        task.completed
                          ? 'text-sys-line/50 line-through decoration-sys-line/30'
                          : 'text-sys-line'
                      }`}
                    >
                      {task.title}
                    </span>
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

                <div className="hidden sm:flex col-span-2 items-center justify-end gap-3 font-mono text-xs">
                  <span
                    className={`px-1.5 py-0.5 border border-sys-line font-bold ${
                      task.priority === 'HIGH'
                        ? 'bg-sys-pink text-sys-white'
                        : task.priority === 'MEDIUM'
                        ? 'bg-sys-white text-sys-line'
                        : 'opacity-60 text-sys-line'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-sys-pink text-sys-line font-mono text-xs px-1"
                    title="Delete task"
                  >
                    [×]
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </SystemWindow>

      {/* New Task Modal */}
      <RetroModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        title="REGISTER NEW TASK"
      >
        <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold">TASK TITLE</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Implement neural search"
              className="retro-border px-3 py-2 bg-sys-white outline-none focus:bg-sys-pale-pink/20"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold">CATEGORY</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="retro-border px-2 py-2 bg-sys-white outline-none"
              >
                <option value="STUDY">STUDY</option>
                <option value="WORK">WORK</option>
                <option value="HEALTH">HEALTH</option>
                <option value="GROWTH">GROWTH</option>
                <option value="SYSTEM">SYSTEM</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold">PRIORITY</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as 'HIGH' | 'MEDIUM' | 'LOW')}
                className="retro-border px-2 py-2 bg-sys-white outline-none"
              >
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold">SCHEDULED TIME (OPTIONAL)</label>
            <input
              type="text"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              placeholder="e.g., 16:45"
              className="retro-border px-3 py-2 bg-sys-white outline-none focus:bg-sys-pale-pink/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t-2 border-sys-line mt-2">
            <button
              type="button"
              onClick={() => setIsNewTaskOpen(false)}
              className="retro-border px-4 py-2 hover:bg-sys-pale-pink/30 font-bold transition-none"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="retro-border px-5 py-2 bg-sys-line text-sys-white hover:bg-sys-pink hover:text-sys-base font-bold transition-none"
            >
              [ + ADD TASK ]
            </button>
          </div>
        </form>
      </RetroModal>
    </div>
  );
}
