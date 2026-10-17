"use client";

import { useState } from 'react';
import { useLifeOS } from '@/lib/useLifeOS';
import { PixelCheckbox } from '@/components/ui/PixelCheckbox';
import { SystemWindow } from '@/components/ui/SystemWindow';
import { RetroModal } from '@/components/ui/RetroModal';

export default function TodayScreen() {
  const { state, metrics, toggleTask, addTask, toggleHabit } = useLifeOS();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('STUDY');
  const [newPriority, setNewPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [newTime, setNewTime] = useState('');

  const tasks = state.tasks;
  const habits = state.habits;
  const sleep = state.sleep;
  const completedHabits = habits.filter((h) => h.completedToday).length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle.trim(), newCategory, newPriority, newTime || undefined);
    setNewTitle('');
    setNewTime('');
    setIsTaskModalOpen(false);
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-2 mb-2">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wider mb-1">TODAY</h1>
          <p className="font-mono text-xs opacity-80 uppercase tracking-widest">{todayStr}</p>
        </div>
        <div className="font-mono text-[11px] bg-sys-line text-sys-pale-pink px-2.5 py-1 border border-sys-pink/30 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-400 inline-block animate-pulse" />
          <span>STORAGE: ACTIVE</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SECTION 1 - DAILY TASKS */}
        <SystemWindow title="DAILY TASKS" className="lg:col-span-8">
          <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-sys-line/20 font-mono text-xs">
            <span className="font-bold opacity-80">
              PROGRESS: {completedTasks} / {tasks.length} COMPLETE
            </span>
            <span className="text-sys-pink font-bold">
              {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
            </span>
          </div>

          <div className="flex flex-col gap-3 min-h-[200px]">
            {tasks.length === 0 ? (
              <div className="p-8 text-center font-mono text-sys-line/50 text-sm">
                NO TASKS LOGGED TODAY. CLICK ADD TASK TO BEGIN.
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between border-b border-sys-line/10 pb-3 last:border-0 last:pb-0 hover:bg-sys-pale-pink/15 px-1 py-1 transition-none"
                >
                  <PixelCheckbox
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    label={task.title}
                    time={task.time}
                  />
                  <div className="flex items-center gap-2 font-mono text-[11px] shrink-0 ml-2">
                    <span className="hidden sm:inline-block opacity-60 uppercase">{task.category}</span>
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
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="mt-6 w-full retro-border py-2.5 text-center font-mono text-xs font-bold hover:bg-sys-pale-pink transition-none active:bg-sys-pink active:text-sys-white"
          >
            + ADD TASK
          </button>
        </SystemWindow>

        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* SECTION 2 - HABITS */}
          <SystemWindow title="HABITS">
            <div className="flex flex-col gap-3 min-h-[140px]">
              {habits.map((habit) => (
                <div key={habit.id} className="flex items-center justify-between">
                  <PixelCheckbox
                    checked={habit.completedToday}
                    onChange={() => toggleHabit(habit.id)}
                    label={habit.title}
                  />
                  <span className="font-mono text-[10px] opacity-70 bg-sys-pale-pink/30 px-1 py-0.5 border border-sys-line/30">
                    {habit.streak}d 🔥
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t-2 border-sys-line font-mono text-xs flex justify-between items-center">
              <span>{completedHabits} / {habits.length} COMPLETE</span>
              <div className="flex gap-1">
                {habits.map((h, i) => (
                  <div
                    key={h.id || i}
                    className={`w-2.5 h-4 border border-sys-line transition-none ${
                      h.completedToday ? 'bg-sys-pink' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          </SystemWindow>

          {/* SECTION 3 - SYSTEM STATUS */}
          <SystemWindow title="SYSTEM STATUS">
            <div className="grid grid-cols-2 gap-y-5 gap-x-3 font-mono text-xs">
              <div className="flex flex-col gap-1 p-2 border border-sys-line/20 bg-sys-white">
                <span className="opacity-70 text-[10px] tracking-wider">FOCUS</span>
                <span className="text-xl font-bold text-sys-pink">{metrics.focus}%</span>
              </div>
              <div className="flex flex-col gap-1 p-2 border border-sys-line/20 bg-sys-white">
                <span className="opacity-70 text-[10px] tracking-wider">ENERGY</span>
                <span className="text-xl font-bold">{metrics.energy}%</span>
              </div>
              <div className="flex flex-col gap-1 p-2 border border-sys-line/20 bg-sys-white">
                <span className="opacity-70 text-[10px] tracking-wider">DISCIPLINE</span>
                <span className="text-xl font-bold text-sys-pink">{metrics.discipline}%</span>
              </div>
              <div className="flex flex-col gap-1 p-2 border border-sys-line/20 bg-sys-white">
                <span className="opacity-70 text-[10px] tracking-wider">RECOVERY</span>
                <span className="text-xl font-bold">{metrics.recovery}%</span>
              </div>
            </div>
          </SystemWindow>

          {/* SECTION 4 - SLEEP */}
          <SystemWindow title="SLEEP">
            <div className="flex flex-col gap-3 font-mono text-xs">
              {sleep ? (
                <>
                  <div className="flex justify-between">
                    <span className="opacity-70">LAST NIGHT</span>
                    <span className="font-bold">{sleep.start} &rarr; {sleep.wake}</span>
                  </div>
                  <div className="flex justify-between items-end border-b-2 border-sys-line/20 pb-2">
                    <span className="text-2xl font-bold text-sys-pink">{sleep.total}</span>
                    <span className="opacity-70 mb-1 text-[10px]">TOTAL DURATION</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="opacity-70">TARGET: {sleep.target}</span>
                    <span>
                      STATUS: <span className="font-bold text-sys-pink">[{sleep.status}]</span>
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center opacity-70">NO DATA</div>
              )}
            </div>
          </SystemWindow>
        </div>
      </div>

      {/* Retro Add Task Modal */}
      <RetroModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="CREATE NEW TASK"
      >
        <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold">TASK TITLE</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Complete compiler lab"
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
              placeholder="e.g., 14:30"
              className="retro-border px-3 py-2 bg-sys-white outline-none focus:bg-sys-pale-pink/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t-2 border-sys-line mt-2">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="retro-border px-4 py-2 hover:bg-sys-pale-pink/30 font-bold transition-none"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="retro-border px-5 py-2 bg-sys-line text-sys-white hover:bg-sys-pink hover:text-sys-base font-bold transition-none"
            >
              [ + SAVE TASK ]
            </button>
          </div>
        </form>
      </RetroModal>
    </div>
  );
}
