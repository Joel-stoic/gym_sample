import { useState, useEffect, useCallback, useMemo } from 'react'
import api from '../lib/api'
import { useDashboardStore } from '../store/dashboardStore'

// ── Export this so page.tsx can import it ──────────────────────────────
export type RevenueMonths = 6 | 12 | 24

export const useDashboard = (revenueRange: RevenueMonths = 6) => {
  const {
    metrics,
    recentActivity,
    expiringMembers,
    monthlyRevenue,   // full 24-month array stored in Zustand
    loaded,
    setDashboardData,
  } = useDashboardStore()

  const [loading, setLoading]           = useState(!loaded)
  const [chartLoading, setChartLoading] = useState(false)
  const [error, setError]               = useState<string | null>(null)
  // Track the previous range so we know when it changes after first load
  const [prevRange, setPrevRange]       = useState<RevenueMonths>(revenueRange)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res  = await api.get('/api/dashboard')
      const data = res.data.data

      setDashboardData({
        metrics:         data?.metrics        || {},
        recentActivity:  data?.activity       || {},
        expiringMembers: data?.expiring       || [],
        monthlyRevenue:  data?.monthlyRevenue || [],  // always 24 months
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [setDashboardData])

  // Initial load
  useEffect(() => {
    if (loaded) {
      setLoading(false)
      return
    }
    fetchDashboard()
  }, [loaded, fetchDashboard])

  // When range changes after first load, show chart-only spinner briefly
  useEffect(() => {
    if (!loaded || revenueRange === prevRange) return
    setChartLoading(true)
    const t = setTimeout(() => {
      setPrevRange(revenueRange)
      setChartLoading(false)
    }, 150)           // just long enough for React to repaint
    return () => clearTimeout(t)
  }, [revenueRange, loaded, prevRange])

  // Slice the full 24-month array to the requested range
  const slicedRevenue = useMemo(
    () => monthlyRevenue.slice(-revenueRange),
    [monthlyRevenue, revenueRange]
  )

  return {
    metrics,
    recentActivity,
    expiringMembers,
    monthlyRevenue: slicedRevenue,  // already sliced — page uses directly
    loading,
    chartLoading,
    error,
    refetch: fetchDashboard,
  }
}