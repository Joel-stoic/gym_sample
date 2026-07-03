'use client'

import { useEffect, useState } from 'react'
import api from '@/src/lib/api'
import {
  BellDot, CalendarClock, CheckCircle2,
  XCircle, User, Phone, CreditCard
} from 'lucide-react'
import { formatDistanceToNow, format, isToday, isThisWeek, isThisMonth, isThisYear } from 'date-fns'

// ── Filter options ─────────────────────────────────────────────────────
type FilterRange = 'today' | 'week' | 'month' | 'year' | 'all'

const FILTER_OPTIONS: { label: string; value: FilterRange }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'All', value: 'all' },
]

function filterNotifications(notifications: any[], range: FilterRange) {
  if (range === 'all') return notifications
  return notifications.filter((n) => {
    const date = new Date(n.createdAt)
    if (range === 'today') return isToday(date)
    if (range === 'week') return isThisWeek(date, { weekStartsOn: 1 })
    if (range === 'month') return isThisMonth(date)
    if (range === 'year') return isThisYear(date)
    return true
  })
}

// ── Skeleton ───────────────────────────────────────────────────────────
const NotificationSkeleton = () => (
  <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.02] p-5 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="h-12 w-12 rounded-2xl bg-white/[0.06] border border-white/[0.06] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="h-4 w-40 rounded bg-white/[0.06]" />
            <div className="h-3 w-full rounded bg-white/[0.05] mt-3" />
            <div className="h-3 w-3/4 rounded bg-white/[0.05] mt-2" />
          </div>
          <div className="h-7 w-16 rounded-xl bg-white/[0.06]" />
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-5">
          <div className="h-3 w-24 rounded bg-white/[0.05]" />
          <div className="h-3 w-28 rounded bg-white/[0.05]" />
          <div className="h-3 w-20 rounded bg-white/[0.05]" />
        </div>
      </div>
    </div>
  </div>
)

// ── Main Page ──────────────────────────────────────────────────────────
const NotificationPage = () => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterRange>('today')

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications')
      setNotifications(res.data.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const filtered = filterNotifications(notifications, filter)

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-sm text-zinc-500 mt-1">WhatsApp renewal alerts & delivery logs</p>
        </div>

        {/* FILTER TOGGLE */}
        <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-150
                ${filter === opt.value
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* COUNT */}
      {!loading && (
        <p className="text-xs text-zinc-600">
          Showing <span className="text-zinc-400 font-medium">{filtered.length}</span> notification{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* LIST */}
      <div className="space-y-4">
        {loading ? (
          <>
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] py-20 flex flex-col items-center justify-center">
            <BellDot className="h-12 w-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-semibold text-white">No notifications</h3>
            <p className="text-sm text-zinc-500 mt-2">
              No alerts found for this period
            </p>
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              className="rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.02] p-5"
            >
              <div className="flex items-start gap-4">

                {/* ICON */}
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border flex-shrink-0
                  ${notif.status === 'SENT'
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                  }`}>
                  {notif.status === 'SENT'
                    ? <CheckCircle2 className="h-5 w-5 text-green-400" />
                    : <XCircle className="h-5 w-5 text-red-400" />
                  }
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400 mb-1">
                        {notif.type.replaceAll('_', ' ')}
                      </p>
                      <h3 className="text-white font-bold text-base">
                        {notif.member?.name}
                      </h3>
                    </div>

                    <div className={`px-3 py-1 rounded-xl text-xs font-medium border whitespace-nowrap flex-shrink-0
                      ${notif.status === 'SENT'
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                      {notif.status === 'SENT' ? (
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                          Sent
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-red-400" />
                          Failed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Structured info pills */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {notif.member?.phone && (
                      <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
                        <Phone className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                        <span className="text-xs text-white font-medium">{notif.member.phone}</span>
                      </div>
                    )}
                    {notif.member?.plan?.name && (
                      <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
                        <span className="text-xs text-white font-medium">{notif.member.plan.name}</span>
                      </div>
                    )}
                    {notif.member?.membershipExpiry && (
                      <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
                        <CalendarClock className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                        <span className="text-xs text-white font-medium">
                          Expires {format(new Date(notif.member.membershipExpiry), 'd MMM yyyy')}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
                      <User className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
                      <span className="text-xs text-zinc-400">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationPage