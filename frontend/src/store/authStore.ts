import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { clearAuth } from '../lib/auth'

interface Staff {
  id: string
  name: string
  email: string
  role: string
  mustChangePassword?: boolean
}

interface Tenant {
  id: string
  name: string
  slug: string
}

interface AuthState {
  staff: Staff | null
  tenant: Tenant | null
  isAuthenticated: boolean
  setAuth: (staff: Staff, tenant: Tenant) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      staff: null,
      tenant: null,
      isAuthenticated: false,

      setAuth: (staff, tenant) => {
        set({
          staff,
          tenant,
          isAuthenticated: true
        })
      },

      logout: () => {
        clearAuth()
        set({
          staff: null,
          tenant: null,
          isAuthenticated: false
        })
      }
    }),
    {
      name: 'auth-storage' // saved in localStorage
    }
  )
)