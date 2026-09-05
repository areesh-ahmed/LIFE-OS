import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto w-full retro-panel p-8 text-center gap-6">
      <div className="font-display text-sys-pink text-4xl">404</div>
      <div className="font-mono text-lg font-bold">SYSTEM MODULE NOT FOUND</div>
      <div className="font-mono text-sm opacity-70">
        The requested directory or system module does not exist in LIFE OS.
      </div>
      <Link href="/today" className="retro-button mt-4">
        RETURN TO OPERATIONS
      </Link>
    </div>
  );
}
