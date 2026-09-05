"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BOOT_LINES = [
  { text: "LIFE OS", delay: 100, className: "font-display text-2xl text-sys-pink" },
  { text: "PERSONAL OPERATING SYSTEM", delay: 300, className: "font-mono" },
  { text: "INITIALIZING...", delay: 800, className: "font-mono mt-4" },
  { text: "TASK SYSTEM ........ OK", delay: 1200, className: "font-mono" },
  { text: "HABIT SYSTEM ....... OK", delay: 1500, className: "font-mono" },
  { text: "SLEEP SYSTEM ....... OK", delay: 1700, className: "font-mono" },
  { text: "ACTIVITY LOG ....... OK", delay: 2000, className: "font-mono" },
  { text: "SYSTEM READY.", delay: 2400, className: "font-mono text-sys-pink mt-4" },
];

export default function BootSequence() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const timers = BOOT_LINES.map((line, index) =>
      setTimeout(() => {
        setVisibleLines((prev) => Math.max(prev, index + 1));
      }, line.delay)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const systemReady = visibleLines === BOOT_LINES.length;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto w-full retro-panel p-8">
      <div className="w-full text-left flex flex-col gap-1">
        {BOOT_LINES.map((line, idx) => (
          <div
            key={idx}
            className={`${line.className} ${
              idx < visibleLines ? "opacity-100" : "opacity-0 hidden"
            }`}
          >
            {line.text}
          </div>
        ))}
      </div>

      {systemReady && (
        <button
          onClick={() => router.push("/today")}
          className="retro-button mt-12 w-full max-w-sm animate-pulse"
        >
          [ ENTER LIFE OS ]
        </button>
      )}

      {/* Skip button for dev / impatience */}
      {!systemReady && (
        <button
          onClick={() => router.push("/today")}
          className="text-sys-line/50 hover:text-sys-line font-mono text-xs mt-12 underline"
        >
          Skip Boot Sequence
        </button>
      )}
    </div>
  );
}
