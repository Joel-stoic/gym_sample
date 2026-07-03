'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2, Users, TrendingUp, Clock, IndianRupee,
  ArrowUpRight, CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null

interface Stats {
  totalGyms: number
  activeGyms: number
  pendingGyms: number
  suspendedGyms: number
  newSignupsThisMonth: number
  totalMembers: number
  totalRevenue: number
  mrr: number
}

interface Tenant {
  id: string
  name: string
  slug: string
  isActive: boolean
  createdAt: string
  _count?: { members: number; staff: number }
}

function toRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentGyms, setRecentGyms] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const [statsRes, tenantsRes] = await Promise.all([
        fetch(`${API}/api/admin/dashboard/stats`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        }),
        fetch(`${API}/api/admin/tenants`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        }),
      ])
      const statsData = await statsRes.json()
      const tenantsData = await tenantsRes.json()
      if (statsData.success) setStats(statsData.data)
      if (tenantsData.success) setRecentGyms((tenantsData.data || []).slice(0, 6))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-crayola border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Gyms',
      value: stats?.totalGyms ?? 0,
      icon: Building2,
      color: 'text-crayola',
      bg: 'bg-crayola-100',
      border: 'border-crayola/20',
      sub: `${stats?.newSignupsThisMonth ?? 0} new this month`,
    },
    {
      label: 'Active Gyms',
      value: stats?.activeGyms ?? 0,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      sub: `${stats?.pendingGyms ?? 0} pending approval`,
    },
    {
      label: 'Total Members',
      value: stats?.totalMembers ?? 0,
      icon: Users,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      sub: 'across all gyms',
    },
    {
      label: 'MRR',
      value: toRupees(stats?.mrr ?? 0),
      icon: TrendingUp,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      sub: `${toRupees(stats?.totalRevenue ?? 0)} all-time`,
    },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-white/40 mt-1">Platform overview across all gyms</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs font-medium transition-all disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, border, sub }) => (
          <div key={label} className={`bg-[#111118] border ${border} rounded-2xl p-5`}>
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-4`}>
              <Icon size={17} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-white/50 mt-0.5">{label}</p>
            <p className="text-[11px] text-white/25 mt-2">{sub}</p>
          </div>
        ))}
      </div>

      {/* Pending approval alert */}
      {(stats?.pendingGyms ?? 0) > 0 && (
        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-300">
                {stats!.pendingGyms} gym{stats!.pendingGyms > 1 ? 's' : ''} waiting for approval
              </p>
              <p className="text-xs text-amber-400/60 mt-0.5">New signups need your review before they can go live</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/gyms?filter=pending')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium rounded-lg transition-all flex-shrink-0"
          >
            Review <ArrowUpRight size={12} />
          </button>
        </div>
      )}

      {/* Recent gyms */}
      <div className="bg-[#111118] border border-white/5 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent Gyms</h2>
          <button
            onClick={() => router.push('/admin/gyms')}
            className="text-xs text-crayola hover:text-violet-300 transition-colors flex items-center gap-1"
          >
            View all <ArrowUpRight size={11} />
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {recentGyms.length === 0 ? (
            <div className="px-6 py-12 text-center text-white/30 text-sm">No gyms yet</div>
          ) : (
            recentGyms.map(gym => (
              <div
                key={gym.id}
                onClick={() => router.push(`/admin/gyms/${gym.id}`)}
                className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-crayola-100 flex items-center justify-center text-crayola text-xs font-bold flex-shrink-0">
                    {gym.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{gym.name}</p>
                    <p className="text-xs text-white/30 truncate">{gym.slug}.jovifitx.online</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  {gym._count && (
                    <div className="hidden sm:flex items-center gap-3 text-xs text-white/30 mr-2">
                      <span>{gym._count.members} members</span>
                      <span>·</span>
                      <span>{gym._count.staff} staff</span>
                    </div>
                  )}
                  <span className="text-xs text-white/30">{formatDate(gym.createdAt)}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    gym.isActive
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {gym.isActive ? 'Active' : 'Pending'}
                  </span>
                  <ArrowUpRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee size={14} className="text-emerald-400" />
            <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">This Month</p>
          </div>
          <p className="text-3xl font-bold text-white">{toRupees(stats?.mrr ?? 0)}</p>
          <p className="text-xs text-white/30 mt-1">Monthly recurring revenue</p>
        </div>
        <div className="bg-[#111118] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee size={14} className="text-crayola" />
            <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">All Time</p>
          </div>
          <p className="text-3xl font-bold text-white">{toRupees(stats?.totalRevenue ?? 0)}</p>
          <p className="text-xs text-white/30 mt-1">Total platform revenue</p>
        </div>
      </div>
    </div>
  )
}