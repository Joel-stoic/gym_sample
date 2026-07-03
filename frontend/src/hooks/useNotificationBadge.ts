// src/hooks/useNotificationBadge.ts
import { useEffect, useState } from 'react'
import api from '@/src/lib/api'

export function useNotificationBadge() {
  const [hasNew, setHasNew] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await api.get('/api/notifications')
        const notifications = res.data.data
        if (!notifications?.length) return

        const latest = notifications[0]?.createdAt
        const lastSeen = localStorage.getItem('notif_last_seen')

        if (!lastSeen || new Date(latest) > new Date(lastSeen)) {
          setHasNew(true)
        }
      } catch {}
    }
    check()
  }, [])

  const markSeen = () => {
    localStorage.setItem('notif_last_seen', new Date().toISOString())
    setHasNew(false)
  }

  return { hasNew, markSeen }
}