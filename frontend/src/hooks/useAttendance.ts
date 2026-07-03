import { useState, useEffect } from 'react'
import api from '@/src/lib/api'
import { toast } from 'sonner'

export const useAttendance = () => {
  const [todayAttendance, setTodayAttendance] = useState<any[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [gymQR, setGymQR] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrLoading, setQrLoading] = useState(false)

  const fetchToday = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/attendance/today')
      setTodayAttendance(res.data.data.attendance)
      setTodayCount(res.data.data.count)
    } catch {
      toast.error('Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }

  const fetchGymQR = async () => {
    try {
      setQrLoading(true)
      const res = await api.get('/api/attendance/qr')
      setGymQR(res.data.data.qrCode)
    } catch {
      toast.error('Failed to load QR code')
    } finally {
      setQrLoading(false)
    }
  }

  // 🔥 FIXED: no toast, only throw error
  const markAttendance = async (memberId: string) => {
    try {
      await api.post('/api/attendance', {
        memberId,
        markedBy: 'STAFF_MANUAL'
      })

      await fetchToday() // refresh data
    } catch (err) {
      throw err // 🔥 IMPORTANT
    }
  }

  useEffect(() => {
    fetchToday()
    fetchGymQR()
  }, [])

  return {
    todayAttendance,
    todayCount,
    gymQR,
    loading,
    qrLoading,
    markAttendance,
    refetch: fetchToday
  }
}