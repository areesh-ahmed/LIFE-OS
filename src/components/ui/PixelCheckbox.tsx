export function PixelCheckbox({ checked, onChange, label, time }: { checked: boolean; onChange: () => void; label: React.ReactNode; time?: string }) {
  return (
    <label className={`flex items-start gap-3 cursor-pointer group select-none ${checked ? 'text-sys-line/50' : 'text-sys-line'}`}>
      {time && <span className="font-mono text-sm pt-[2px] w-12 text-right opacity-70">{time}</span>}
      <div className="relative pt-[2px]">
        <div className={`w-4 h-4 border-2 border-sys-line transition-none flex items-center justify-center ${checked ? 'bg-sys-line' : 'bg-sys-white group-hover:bg-sys-pale-pink'}`}>
          {checked && <div className="w-2 h-2 bg-sys-white" />}
        </div>
      </div>
      <span className={`font-mono text-sm leading-tight pt-[2px] ${checked ? 'line-through decoration-sys-line/30' : ''}`}>
        {label}
      </span>
      {/* Hidden native input for accessibility */}
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
    </label>
  );
}
