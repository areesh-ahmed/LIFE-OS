'use client'

import React from 'react'

export default function LoginPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

  const handleLogin = () => {
    window.location.href = `${apiBase}/auth/google`
  }

  return (
    <div className="fixed inset-0 bg-sys-base flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="w-full max-w-md">
        {/* Window chrome */}
        <div className="border-2 border-sys-line">
          {/* Title bar */}
          <div className="bg-sys-line text-sys-white px-3 py-1 font-display text-sm tracking-wider flex justify-between items-center">
            <span>SYSTEM BOOT</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-sys-white" />
              <div className="w-2 h-2 bg-sys-white" />
            </div>
          </div>
          {/* Content */}
          <div className="bg-sys-base p-8 text-center space-y-6">
            <div>
              <h1 className="font-display text-2xl tracking-widest uppercase text-sys-white">
                LIFE_OS
              </h1>
              <p className="text-sys-white/50 text-xs mt-2 font-mono uppercase tracking-widest">
                Personal Operating System
              </p>
            </div>

            <div className="h-px bg-sys-line/30 w-full" />

            <div>
              <p className="text-red-400 text-sm font-mono animate-pulse">
                SYSTEM OFFLINE
              </p>
              <p className="text-sys-white/40 text-xs font-mono mt-1">
                Authentication Required
              </p>
            </div>

            <button
              onClick={handleLogin}
              className="w-full mt-4 border-2 border-sys-line bg-sys-dark-violet hover:bg-sys-line/20 text-sys-white py-3 px-4 font-mono text-sm uppercase transition-none flex items-center justify-center gap-2"
            >
              <span>[</span>
              <span>CONTINUE WITH GOOGLE</span>
              <span>]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
