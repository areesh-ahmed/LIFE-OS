export function SystemWindow({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`retro-panel flex flex-col ${className}`}>
      <div className="bg-sys-line text-sys-white px-3 py-1 font-display text-sm tracking-wider flex justify-between items-center border-b-2 border-sys-line">
        <span>{title}</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-sys-white" />
          <div className="w-2 h-2 bg-sys-white" />
        </div>
      </div>
      <div className="p-4 flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
