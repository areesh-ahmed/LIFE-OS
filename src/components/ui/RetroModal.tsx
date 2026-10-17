"use client";

import React, { useEffect } from 'react';

interface RetroModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function RetroModal({ isOpen, onClose, title, children }: RetroModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sys-line/60 backdrop-blur-none animate-in fade-in duration-100">
      <div 
        className="w-full max-w-md retro-panel retro-shadow flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="bg-sys-line text-sys-white px-3 py-1.5 font-display text-sm tracking-wider flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-sys-pink inline-block" />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="text-sys-white hover:text-sys-pink font-mono text-xs px-1 active:bg-sys-white active:text-sys-line transition-none"
            aria-label="Close modal"
          >
            [X]
          </button>
        </div>

        {/* Modal content */}
        <div className="p-5 font-mono text-xs flex flex-col gap-4 bg-sys-white">
          {children}
        </div>
      </div>
    </div>
  );
}
