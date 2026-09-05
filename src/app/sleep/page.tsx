import { SystemWindow } from '@/components/ui/SystemWindow';
import { mockSleep } from '@/lib/mockData';

const WEEKLY_SLEEP = [
  { day: 'MON', duration: '7h 12m', hours: 7.2 },
  { day: 'TUE', duration: '6h 48m', hours: 6.8 },
  { day: 'WED', duration: '7h 31m', hours: 7.5 },
  { day: 'THU', duration: '8h 02m', hours: 8.03 },
  { day: 'FRI', duration: '7h 31m', hours: 7.5 },
];

export default function SleepScreen() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-8 h-full">
      <header className="mb-2">
        <h1 className="font-display text-2xl md:text-3xl tracking-wider mb-2 uppercase">SLEEP LOG</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SystemWindow title="LAST NIGHT">
          <div className="flex flex-col gap-4 font-mono">
            <div className="grid grid-cols-2 gap-4 border-b-2 border-sys-line/20 pb-4">
              <div>
                <div className="text-xs opacity-70 mb-1">START</div>
                <div className="text-2xl font-bold">{mockSleep.start}</div>
              </div>
              <div>
                <div className="text-xs opacity-70 mb-1">WAKE</div>
                <div className="text-2xl font-bold">{mockSleep.wake}</div>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="opacity-70 text-sm">TOTAL SLEEP</span>
              <span className="text-3xl font-bold">{mockSleep.total}</span>
            </div>
          </div>
        </SystemWindow>

        <SystemWindow title="WEEKLY OVERVIEW">
          <div className="flex flex-col gap-4 font-mono h-full justify-between">
            <div className="flex justify-between items-center mb-2">
              <span className="opacity-70 text-sm">AVERAGE</span>
              <span className="text-xl font-bold">7h 24m</span>
            </div>
            
            <div className="flex items-end justify-between h-32 mt-4 pt-4 border-t-2 border-sys-line/20 gap-2">
              {WEEKLY_SLEEP.map(log => (
                <div key={log.day} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-[10px] opacity-70 rotate-90 sm:rotate-0 mb-2 sm:mb-0 hidden xs:inline-block">{log.duration}</span>
                  <div className="w-full bg-sys-line relative" style={{ height: `${(log.hours / 9) * 100}%` }}>
                    <div className="absolute top-0 w-full h-[2px] bg-sys-white opacity-50" />
                  </div>
                  <span className="text-xs font-bold">{log.day}</span>
                </div>
              ))}
            </div>
          </div>
        </SystemWindow>
      </div>
    </div>
  );
}
