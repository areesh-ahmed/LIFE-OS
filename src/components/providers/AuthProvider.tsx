'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authApi } from '@/lib/api'

type User = {
  id: string
  name: string
  email: string
  avatarUrl: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await authApi.getMe()
        setUser(data.user)
        if (pathname === '/login') {
          router.push('/today') // redirect to dashboard if logged in and on login page
        }
      } catch (err) {
        setUser(null)
        if (pathname !== '/login') {
          router.push('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  const logout = async () => {
    try {
      await authApi.logout()
      setUser(null)
      router.push('/login')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-500 font-mono animate-pulse uppercase tracking-widest text-sm">
          [ Initializing System... ]
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
