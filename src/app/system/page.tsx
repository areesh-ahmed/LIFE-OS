import { SystemWindow } from '@/components/ui/SystemWindow';

export default function SystemScreen() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-8 h-full">
      <header className="mb-2">
        <h1 className="font-display text-2xl md:text-3xl tracking-wider mb-2 uppercase">SYSTEM DIAGNOSTICS</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SystemWindow title="SYSTEM STATUS — TODAY" className="retro-panel-dark">
          <div className="flex flex-col gap-4 font-mono p-2">
            <div className="flex justify-between items-center border-b border-sys-white/20 pb-2">
              <span className="opacity-70">TASKS</span>
              <span className="text-sys-pink font-bold text-lg">08/11</span>
            </div>
            <div className="flex justify-between items-center border-b border-sys-white/20 pb-2">
              <span className="opacity-70">HABITS</span>
              <span className="text-sys-pink font-bold text-lg">06/08</span>
            </div>
            <div className="flex justify-between items-center border-b border-sys-white/20 pb-2">
              <span className="opacity-70">FOCUS</span>
              <span className="text-sys-pink font-bold text-lg">03h 21m</span>
            </div>
            <div className="flex justify-between items-center border-b border-sys-white/20 pb-2">
              <span className="opacity-70">SLEEP</span>
              <span className="text-sys-pink font-bold text-lg">07h 31m</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="opacity-70">WEEK</span>
              <span className="text-sys-pink font-bold text-xl">78%</span>
            </div>
          </div>
        </SystemWindow>

        <SystemWindow title="HARDWARE SIMULATION">
          <div className="flex flex-col gap-4 font-mono text-sm p-2">
            <div className="flex justify-between">
              <span>MEMORY</span>
              <span className="font-bold">64K</span>
            </div>
            <div className="flex justify-between">
              <span>TASK QUEUE</span>
              <span className="font-bold">07</span>
            </div>
            <div className="flex justify-between">
              <span>UPTIME</span>
              <span className="font-bold">14:02:11</span>
            </div>
            
            <div className="mt-4 border-t-2 border-sys-line pt-4">
              <div className="flex justify-between items-end mb-2">
                <span>CPU USAGE</span>
                <span>24%</span>
              </div>
              <div className="w-full h-4 border-2 border-sys-line p-[2px]">
                <div className="h-full bg-sys-line w-1/4 animate-pulse" />
              </div>
            </div>
          </div>
        </SystemWindow>
      </div>
    </div>
  );
}
