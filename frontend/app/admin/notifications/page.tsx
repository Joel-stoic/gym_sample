'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Bell, RefreshCw } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL
const getToken = () => localStorage.getItem('adminToken')

const STATUS_COLORS: Record<string, string> = {
  SENT:   'bg-emerald-500/10 text-emerald-400',
  FAILED: 'bg-red-500/10 text-red-400',
}

const TYPE_LABELS: Record<string, string> = {
  RENEWAL_7DAY: '7 Day Reminder',
  RENEWAL_3DAY: '3 Day Reminder',
  RENEWAL_1DAY: '1 Day Reminder',
  EXPIRED:      'Expired',
}

export default function NotificationsPage() {
  const [logs, setLogs]       = useState<any[]>([])
  const [summary, setSummary] = useState({ sent: 0, failed: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [status, setStatus]   = useState('')
  const [type, setType]       = useState('')

  useEffect(() => { fetchLogs() }, [status, type])

  const fetchLogs = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (type)   params.set('type', type)

    const res  = await fetch(`${API}/api/admin/notifications?${params}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    const data = await res.json()
    if (data.success) {
      setLogs(data.data.logs)
      setSummary({ sent: data.data.sent, failed: data.data.failed, total: data.data.total })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">WhatsApp Notifications</h1>
          <p className="text-sm text-white/40 mt-1">Monitor all outgoing messages</p>
        </div>
        <button onClick={() => fetchLogs()}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs transition-all">
          <RefreshCw size={13} />Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Sent',   value: summary.total,  color: 'text-white' },
          { label: 'Delivered',    value: summary.sent,   color: 'text-emerald-400' },
          { label: 'Failed',       value: summary.failed, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#111118] border border-white/5 rounded-2xl p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="bg-[#111118] border border-white/5 rounded-xl px-3 py-2 text-sm text-white outline-none">
          <option value="">All Status</option>
          <option value="SENT">Sent</option>
          <option value="FAILED">Failed</option>
        </select>
        <select value={type} onChange={e => setType(e.target.value)}
          className="bg-[#111118] border border-white/5 rounded-xl px-3 py-2 text-sm text-white outline-none">
          <option value="">All Types</option>
          <option value="RENEWAL_7DAY">7 Day Reminder</option>
          <option value="RENEWAL_3DAY">3 Day Reminder</option>
          <option value="RENEWAL_1DAY">1 Day Reminder</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      {/* Log table */}
      <div className="bg-[#111118] border border-white/5 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <p className="text-sm font-semibold text-white">Recent Logs</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-crayola border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <Bell size={28} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map(log => (
              <div key={log.id} className="px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {log.status === 'SENT'
                    ? <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
                    : <XCircle    size={15} className="text-red-400 flex-shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm text-white">
                      {log.member?.name || '—'}
                      <span className="text-white/30 ml-2 text-xs">{log.member?.phone}</span>
                    </p>
                    <p className="text-xs text-white/30 truncate">
                      {log.tenant?.name} · {TYPE_LABELS[log.type] || log.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[log.status] || 'bg-white/5 text-white/30'}`}>
                    {log.status}
                  </span>
                  <p className="text-xs text-white/30">
                    {new Date(log.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}