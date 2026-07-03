import { create } from 'zustand'

interface DashboardStore {
  loaded: boolean
  metrics: any
  recentActivity: any
  expiringMembers: any[]
  monthlyRevenue: any[]
  setDashboardData: (data: {
    metrics: any
    recentActivity: any
    expiringMembers: any[]
    monthlyRevenue: any[]
  }) => void
  resetDashboard: () => void  // ← add this
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  loaded: false,
  metrics: null,
  recentActivity: null,
  expiringMembers: [],
  monthlyRevenue: [],

  setDashboardData: (data) => set({ ...data, loaded: true }),

  resetDashboard: () => set({
  loaded: false,
  metrics: null,
  recentActivity: null,
  expiringMembers: [],
  monthlyRevenue: [],
}),
}))