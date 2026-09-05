import { SystemWindow } from '@/components/ui/SystemWindow';

const LOGS = [
  {
    date: '04 SEP 2026',
    entries: [
      { time: '09:14', text: 'Java — Binary Search', status: '✓' },
      { time: '10:42', text: 'Breakfast', status: '✓' },
      { time: '11:30', text: 'Assignment', status: '✓' },
      { time: '13:15', text: 'Water target', status: '✓' },
      { time: '17:45', text: 'Workout', status: '✓' },
      { time: '23:48', text: 'Sleep routine', status: '✓' },
    ]
  },
  {
    date: '03 SEP 2026',
    entries: [
      { time: '08:52', text: 'Java', status: '✓' },
      { time: '17:20', text: 'Workout', status: '✓' },
    ]
  }
];

export default function LogScreen() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-8 h-full">
      <header className="mb-2">
        <h1 className="font-display text-2xl md:text-3xl tracking-wider mb-2 uppercase">ACTIVITY LOG</h1>
      </header>

      <SystemWindow title="SYSTEM TERMINAL" className="flex-1 retro-panel-dark">
        <div className="flex flex-col gap-8 font-mono text-sm p-2 overflow-y-auto">
          {LOGS.map(day => (
            <div key={day.date} className="flex flex-col gap-2">
              <div className="text-sys-pink font-bold border-b border-sys-white/20 pb-1">{day.date}</div>
              {day.entries.map((entry, idx) => (
                <div key={idx} className="flex gap-4 items-start hover:bg-sys-white/10 px-2 py-1">
                  <span className="opacity-70 w-12 shrink-0">{entry.time}</span>
                  <span className="text-sys-pink">{entry.status}</span>
                  <span>{entry.text}</span>
                </div>
              ))}
            </div>
          ))}
          <div className="mt-4 flex gap-2 items-center text-sys-white/50 animate-pulse">
            <div className="w-2 h-4 bg-sys-white/50" />
            <span>WAITING FOR INPUT...</span>
          </div>
        </div>
      </SystemWindow>
    </div>
  );
}
