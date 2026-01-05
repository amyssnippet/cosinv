import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface HRUser {
  id: string
  email: string
  name: string
  company: string
  role: 'admin' | 'hr' | 'interviewer'
  avatar?: string
}

interface AuthState {
  user: HRUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: HRUser, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'hr-auth-storage',
    }
  )
)
