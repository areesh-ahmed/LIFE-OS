'use client'

import React from 'react'
import { SystemWindow } from '@/components/ui/SystemWindow'

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:4000/api/auth/google'
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SystemWindow title="SYSTEM BOOT" variant="secondary" className="mb-8">
          <div className="p-6 text-center space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-widest uppercase">
                LIFE OS
              </h1>
              <p className="text-gray-400 text-xs mt-2 font-mono uppercase tracking-widest">
                Personal Operating System
              </p>
            </div>
            
            <div className="h-px bg-purple-500/30 w-full" />

            <div>
              <p className="text-red-400 text-sm font-mono animate-pulse">
                SYSTEM OFFLINE
              </p>
              <p className="text-gray-500 text-xs font-mono mt-1">
                Authentication Required
              </p>
            </div>

            <button
              onClick={handleLogin}
              className="w-full mt-4 bg-purple-900/40 border border-purple-500/50 hover:bg-purple-500/20 text-purple-300 py-3 px-4 font-mono text-sm uppercase transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-purple-400 active:bg-purple-500/40 flex items-center justify-center space-x-2"
            >
              <span>[</span>
              <span>CONTINUE WITH GOOGLE</span>
              <span>]</span>
            </button>
          </div>
        </SystemWindow>
      </div>
    </div>
  )
}
