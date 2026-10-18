"use client";

import { useState } from 'react';
import { useLifeOS } from '@/lib/useLifeOS';
import { PixelCheckbox } from '@/components/ui/PixelCheckbox';
import { SystemWindow } from '@/components/ui/SystemWindow';
import { RetroModal } from '@/components/ui/RetroModal';
import { Priority, SleepQuality } from '@/lib/types';
import { getTodayDateString } from '@/lib/dateUtils';

export default function TodayScreen() {
  const { state, metrics, toggleTask, addTask, toggleHabit, addHabit, logSleep } = useLifeOS();
  
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);

  // Task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('STUDY');
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [newTime, setNewTime] = useState('');

  // Habit form state
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitFreq, setNewHabitFreq] = useState('Daily');
  const [newHabitTarget, setNewHabitTarget] = useState(7);

  // Sleep form state
  const [sleepStart, setSleepStart] = useState('23:00');
  const [sleepWake, setSleepWake] = useState('07:00');
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>('GOOD');
  const [sleepTarget, setSleepTarget] = useState('8h 00m');

  const todayStr = getTodayDateString();
  const tasks = state.tasks;
  const habits = state.habits;
  const sleep = state.sleep;

  // Filter tasks for today
  const todayTasks = tasks.filter((t) => t.date === todayStr || !t.date);
  const completedTasks = todayTasks.filter((t) => t.completed).length;
  const completedHabits = habits.filter((h) => h.completedToday).length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle.trim(), newCategory, newPriority, newTime || undefined, todayStr);
    setNewTitle('');
    setNewTime('');
    setIsTaskModalOpen(false);
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    addHabit(newHabitTitle.trim(), newHabitFreq, Number(newHabitTarget));
    setNewHabitTitle('');
    setIsHabitModalOpen(false);
  };

  const handleLogSleep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sleepStart || !sleepWake) return;
    logSleep({
      date: todayStr,
      start: sleepStart,
      wake: sleepWake,
      status: sleepQuality,
      targetFormatted: sleepTarget,
    });
    setIsSleepModalOpen(false);
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
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
          <p className="font-mono text-xs opacity-80 uppercase tracking-widest">{formattedDate}</p>
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
              PROGRESS: {completedTasks} / {todayTasks.length} COMPLETE
            </span>
            <span className="text-sys-pink font-bold">
              {todayTasks.length > 0 ? Math.round((completedTasks / todayTasks.length) * 100) : 0}%
            </span>
          </div>

          <div className="flex flex-col gap-3 min-h-[200px]">
            {todayTasks.length === 0 ? (
              <div className="p-8 text-center font-mono border border-dashed border-sys-line/30 bg-sys-pale-pink/5 flex flex-col items-center justify-center gap-2 my-auto">
                <span className="text-sys-pink font-bold text-sm">[ NO TASKS LOGGED ]</span>
                <span className="text-sys-line/70 text-xs">ADD YOUR FIRST TASK TO BEGIN DAILY EXECUTION.</span>
              </div>
            ) : (
              todayTasks.map((task) => (
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
              {habits.length === 0 ? (
                <div className="p-4 text-center font-mono border border-dashed border-sys-line/30 bg-sys-pale-pink/5 flex flex-col items-center justify-center gap-2 my-auto">
                  <span className="text-sys-pink font-bold text-xs">[ NO HABITS CONFIGURED ]</span>
                  <span className="text-sys-line/60 text-[11px]">CREATE A HABIT TO START TRACKING.</span>
                  <button
                    onClick={() => setIsHabitModalOpen(true)}
                    className="mt-2 retro-border px-3 py-1 text-[11px] hover:bg-sys-pale-pink font-bold"
                  >
                    + CREATE HABIT
                  </button>
                </div>
              ) : (
                habits.map((habit) => (
                  <div key={habit.id} className="flex items-center justify-between">
                    <PixelCheckbox
                      checked={Boolean(habit.completedToday)}
                      onChange={() => toggleHabit(habit.id)}
                      label={habit.title}
                    />
                    <span className="font-mono text-[10px] opacity-70 bg-sys-pale-pink/30 px-1 py-0.5 border border-sys-line/30">
                      {habit.streak || 0}d 🔥
                    </span>
                  </div>
                ))
              )}
            </div>

            {habits.length > 0 && (
              <div className="mt-4 pt-3 border-t-2 border-sys-line font-mono text-xs flex justify-between items-center">
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
            )}
          </SystemWindow>

          {/* SECTION 3 - SYSTEM STATUS */}
          <SystemWindow title="SYSTEM STATUS">
            <div className="grid grid-cols-2 gap-y-3 gap-x-3 font-mono text-xs">
              <div className="flex flex-col gap-1 p-2 border border-sys-line/20 bg-sys-white">
                <span className="opacity-70 text-[10px] tracking-wider">FOCUS</span>
                <span className="text-xl font-bold text-sys-pink">
                  {metrics.isRated ? `${metrics.focus}%` : '0%'}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-2 border border-sys-line/20 bg-sys-white">
                <span className="opacity-70 text-[10px] tracking-wider">ENERGY</span>
                <span className="text-xl font-bold">
                  {metrics.isRated ? `${metrics.energy}%` : '0%'}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-2 border border-sys-line/20 bg-sys-white">
                <span className="opacity-70 text-[10px] tracking-wider">DISCIPLINE</span>
                <span className="text-xl font-bold text-sys-pink">
                  {metrics.isRated ? `${metrics.discipline}%` : '0%'}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-2 border border-sys-line/20 bg-sys-white">
                <span className="opacity-70 text-[10px] tracking-wider">RECOVERY</span>
                <span className="text-xl font-bold">
                  {metrics.isRated ? `${metrics.recovery}%` : '0%'}
                </span>
              </div>
            </div>
            {!metrics.isRated && (
              <p className="mt-2 text-[10px] font-mono text-center opacity-60">
                AWAITING METRICS &bull; LOG DATA TO CALIBRATE
              </p>
            )}
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
                <div className="p-4 text-center font-mono border border-dashed border-sys-line/30 bg-sys-pale-pink/5 flex flex-col items-center justify-center gap-2">
                  <span className="text-sys-pink font-bold text-xs">[ NO SLEEP RECORD ]</span>
                  <span className="text-sys-line/60 text-[11px]">LOG YOUR LAST NIGHT&apos;S SLEEP.</span>
                  <button
                    onClick={() => setIsSleepModalOpen(true)}
                    className="mt-1 retro-border px-3 py-1 text-[11px] hover:bg-sys-pale-pink font-bold"
                  >
                    + LOG SLEEP
                  </button>
                </div>
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
              placeholder="e.g., Complete project milestone"
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
                onChange={(e) => setNewPriority(e.target.value as Priority)}
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

      {/* Retro Add Habit Modal */}
      <RetroModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        title="TRACK NEW HABIT"
      >
        <form onSubmit={handleCreateHabit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold">HABIT PROTOCOL NAME</label>
            <input
              type="text"
              required
              value={newHabitTitle}
              onChange={(e) => setNewHabitTitle(e.target.value)}
              placeholder="e.g., Morning Sunlight / 3L Hydration"
              className="retro-border px-3 py-2 bg-sys-white outline-none focus:bg-sys-pale-pink/20"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold">FREQUENCY</label>
              <select
                value={newHabitFreq}
                onChange={(e) => setNewHabitFreq(e.target.value)}
                className="retro-border px-2 py-2 bg-sys-white outline-none"
              >
                <option value="Daily">Daily</option>
                <option value="5x/week">5x/week</option>
                <option value="4x/week">4x/week</option>
                <option value="3x/week">3x/week</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold">WEEKLY TARGET</label>
              <input
                type="number"
                min={1}
                max={7}
                value={newHabitTarget}
                onChange={(e) => setNewHabitTarget(Number(e.target.value))}
                className="retro-border px-3 py-2 bg-sys-white outline-none focus:bg-sys-pale-pink/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t-2 border-sys-line mt-2">
            <button
              type="button"
              onClick={() => setIsHabitModalOpen(false)}
              className="retro-border px-4 py-2 hover:bg-sys-pale-pink/30 font-bold transition-none"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="retro-border px-5 py-2 bg-sys-line text-sys-white hover:bg-sys-pink hover:text-sys-base font-bold transition-none"
            >
              [ + SAVE HABIT ]
            </button>
          </div>
        </form>
      </RetroModal>

      {/* Quick Sleep Log Modal */}
      <RetroModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
        title="LOG SLEEP PROTOCOL"
      >
        <form onSubmit={handleLogSleep} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold">BEDTIME (START)</label>
              <input
                type="time"
                required
                value={sleepStart}
                onChange={(e) => setSleepStart(e.target.value)}
                className="retro-border px-2 py-2 bg-sys-white outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold">WAKE TIME</label>
              <input
                type="time"
                required
                value={sleepWake}
                onChange={(e) => setSleepWake(e.target.value)}
                className="retro-border px-2 py-2 bg-sys-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold">RECOVERY QUALITY</label>
              <select
                value={sleepQuality}
                onChange={(e) => setSleepQuality(e.target.value as SleepQuality)}
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
                value={sleepTarget}
                onChange={(e) => setSleepTarget(e.target.value)}
                placeholder="e.g. 8h 00m"
                className="retro-border px-2 py-2 bg-sys-white outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t-2 border-sys-line mt-2">
            <button
              type="button"
              onClick={() => setIsSleepModalOpen(false)}
              className="retro-border px-4 py-2 hover:bg-sys-pale-pink/30 font-bold transition-none"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="retro-border px-5 py-2 bg-sys-line text-sys-white hover:bg-sys-pink hover:text-sys-base font-bold transition-none"
            >
              [ + SAVE SLEEP ]
            </button>
          </div>
        </form>
      </RetroModal>
    </div>
  );
}
