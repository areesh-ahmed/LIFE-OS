'use client'

import React, { createContext, useContext } from 'react'

type AuthContextType = {
  user: null
  isLoading: false
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: null, isLoading: false, logout: async () => {} }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
