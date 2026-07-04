'use client'

import { useState } from 'react'
import {
  Users, UserCheck, UserX, IndianRupee,
  CalendarCheck, TrendingUp, AlertCircle, Activity,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useDashboard, type RevenueMonths } from '@/src/hooks/useDashboard'
import { toRupees } from '@/src/lib/utils'
// import * as Sentry from '@sentry/nextjs'

// ─── Skeleton ─────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-violet-600/[0.05] ${className}`} />
  )
}
function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <Skeleton className="mb-4 h-9 w-9 rounded-xl" />
      <Skeleton className="mb-2 h-7 w-24" />
      <Skeleton className="mb-3 h-3 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}
function DashboardSkeleton() {
  return (
    <div className="min-h-screen space-y-5 p-4 sm:p-6" >
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="mb-2 h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-36 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {[...Array(5)].map((_, i) => <MetricCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => <MetricCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="h-72 rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <Skeleton className="mb-4 h-4 w-32" />
          <Skeleton className="h-full w-full" />
        </div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-72 rounded-2xl border border-border bg-card p-5">
            <Skeleton className="mb-4 h-4 w-32" />
            <Skeleton className="h-full w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Metric Card ──────────────────────────────────────────────────────
function MetricCard({
  title, value, sub, icon: Icon, redAccent, iconClass,
}: {
  title: string
  value: string | number
  sub?: string
  icon: React.ElementType
  redAccent?: boolean
  iconClass?: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-3.5 sm:p-5 transition-all duration-200 ${redAccent
      ? 'border-red-500/20 bg-red-500/10 hover:border-red-500/30'
      : 'border-border bg-card hover:border-white/[0.10]'
      }`}>
      {redAccent && (
        <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-red-500 opacity-20 blur-2xl" />
      )}
      <div className={`mb-3 sm:mb-4 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl ${iconClass ?? 'bg-white/[0.06] text-foreground'}`}>
        <Icon size={16} />
      </div>
      <p className="font-['Syne'] text-lg sm:text-2xl font-bold tracking-tight text-foreground truncate">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-muted-foreground truncate">{sub}</p>}
      <p className="mt-2 sm:mt-3 text-[10px] sm:text-[11px] font-medium uppercase tracking-widest text-muted-foreground line-clamp-2 leading-snug">{title}</p>
    </div>
  )
}

// ─── Revenue Range Toggle ─────────────────────────────────────────────
const RANGE_OPTIONS: { label: string; months: RevenueMonths }[] = [
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: '2Y', months: 24 },
]
function RevenueRangeToggle({
  value, onChange,
}: {
  value: RevenueMonths
  onChange: (r: RevenueMonths) => void
}) {
  return (
    <div className="flex gap-1 rounded-lg border border-border bg-white/[0.03] p-1">
      {RANGE_OPTIONS.map(({ label, months }) => (
        <button
          key={months}
          onClick={() => onChange(months)}
          className={`rounded-md px-2.5 sm:px-3 py-1 text-[11px] font-medium transition-all duration-150 ${value === months
            ? 'bg-violet-600 text-foreground shadow'
            : 'text-muted-foreground hover:text-muted-foreground'
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Custom Tooltip ───────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-border bg-background px-3 py-2 text-[12px] shadow-xl">
        <p className="text-muted-foreground">{label}</p>
        <p className="mt-1 font-semibold text-violet-300">{toRupees(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

// ─── Revenue Stats ────────────────────────────────────────────────────
function RevenueStats({ data }: { data: { month: string; revenue: number }[] }) {
  if (!data.length) return null
  const nonZero = data.filter(d => Number(d.revenue) > 0)
  const total = data.reduce((s, d) => s + Number(d.revenue), 0)
  const avg = nonZero.length ? Math.round(total / nonZero.length) : 0
  const peak = Math.max(...data.map(d => Number(d.revenue)))

  const stats = [
    { label: 'Total Earned', value: toRupees(total) },
    { label: 'Avg / Month', value: toRupees(avg) },
    { label: 'Peak Month', value: toRupees(peak) },
  ]

  return (
    <div className="grid grid-cols-1 min-[450px]:grid-cols-3 gap-2 sm:gap-3 pb-1">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-3 sm:px-4 py-3 sm:py-3.5"
        >
          <span className="text-[12px] sm:text-[14px] font-semibold text-emerald-300">{value}</span>
          <span className="text-[10px] sm:text-[11px] tracking-wide text-emerald-600">{label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Expiring Member Row ──────────────────────────────────────────────
function ExpiringMemberRow({ name, daysLeft }: { name: string; daysLeft: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const isCritical = daysLeft <= 2
  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-[11px] font-semibold ${isCritical ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
        }`}>
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-foreground">{name}</p>
        <p className="text-[11px] text-muted-foreground">
          {daysLeft === 0 ? 'Expires today' : `Expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`}
        </p>
      </div>
      <span className={`flex-shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium ${isCritical
        ? 'border-red-500/20 bg-red-500/10 text-red-400'
        : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
        }`}>
        {isCritical ? 'Critical' : 'Soon'}
      </span>
    </div>
  )
}

// ─── Activity Item ────────────────────────────────────────────────────
function ActivityItem({
  name, action, amount, time, type,
}: {
  name: string; action: string; amount?: string; time: string; type: 'payment' | 'checkin'
}) {
  return (
    <div className="flex items-center gap-3 border-b border-white/[0.05] py-3 last:border-0">
      <div className={`h-2 w-2 flex-shrink-0 rounded-full ${type === 'payment' ? 'bg-emerald-400' : 'bg-violet-400'
        }`} />
      <p className="flex-1 text-[12px] text-muted-foreground">
        <span className="font-medium text-foreground">{name}</span>{' '}
        {action}
        {amount && <span className="ml-1 font-medium text-emerald-400">{amount}</span>}
      </p>
      <span className="flex-shrink-0 text-[11px] text-muted-foreground">{time}</span>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [revenueRange, setRevenueRange] = useState<RevenueMonths>(6)

  const {
    metrics,
    recentActivity,
    expiringMembers,
    monthlyRevenue,
    loading,
    chartLoading,
    error,
  } = useDashboard(revenueRange)

  const tickInterval = Math.max(0, Math.ceil(monthlyRevenue.length / 7) - 1)

  if (loading) return <DashboardSkeleton />

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-red-400">
        <AlertCircle size={18} />
        <span className="text-sm">{error}</span>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen space-y-4 sm:space-y-5 p-4 sm:p-6"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
    
      {/* ── Top metric cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          title="Total Members"
          value={metrics?.members?.total ?? 0}
          sub={`+${metrics?.members?.newThisMonth ?? 0} new this month`}
          icon={Users}
          iconClass="bg-violet-600/20 text-violet-400"
        />
        <MetricCard
          title="Active Members"
          value={metrics?.members?.active ?? 0}
          sub={`${metrics?.members?.total
            ? Math.round(((metrics.members.active ?? 0) / metrics.members.total) * 100)
            : 0}% retention`}
          icon={UserCheck}
          iconClass="bg-emerald-500/20 text-emerald-400"
        />
        <MetricCard
          title="Today's Attendance"
          value={metrics?.attendance?.today ?? 0}
          sub="check-ins today"
          icon={CalendarCheck}
          iconClass="bg-blue-500/20 text-blue-400"
        />
        <MetricCard
          redAccent
          title="Expired Members"
          value={metrics?.members?.expired ?? 0}
          sub="inactive memberships"
          icon={UserX}
          iconClass="bg-red-500/20 text-red-400"
        />
        <MetricCard
          redAccent
          title="Need Renewal"
          value={metrics?.members?.expiringThisWeek ?? 0}
          sub="expiring this week"
          icon={TrendingUp}
          iconClass="bg-red-500/20 text-red-400"
        />
      </div>

      {/* ── Revenue metric cards ── */}
      {metrics?.revenue && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard
            title="Membership Revenue"
            value={toRupees(metrics.revenue.thisMonth ?? 0)}
            sub="this month"
            icon={IndianRupee}
            iconClass="bg-emerald-500/20 text-emerald-400"
          />
          <MetricCard
            title="PT Revenue"
            value={toRupees(metrics.revenue.ptThisMonth ?? 0)}
            sub="personal training"
            icon={IndianRupee}
            iconClass="bg-blue-500/20 text-blue-400"
          />
          <MetricCard
            title="Total Revenue"
            value={toRupees(metrics.revenue.totalThisMonth ?? 0)}
            sub="membership + PT"
            icon={IndianRupee}
            iconClass="bg-violet-600/20 text-violet-400"
          />
          <MetricCard
            redAccent
            title="Pending Dues"
            value={toRupees(metrics.revenue.pendingDues ?? 0)}
            sub="unpaid"
            icon={AlertCircle}
            iconClass="bg-red-500/20 text-red-400"
          />
        </div>
      )}

      {/* ── Bottom section ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">

        {/* ── Revenue chart ── */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 lg:col-span-2">

          {/* Header */}
          <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[14px] sm:text-[15px] font-semibold text-foreground">Monthly Revenue</p>
              <p className="mt-0.5 text-[11px] sm:text-[12px] text-muted-foreground">Membership + PT earnings over time</p>
            </div>
            <div className="self-start sm:self-auto">
              <RevenueRangeToggle value={revenueRange} onChange={setRevenueRange} />
            </div>
          </div>

          {/* Chart */}
          {chartLoading ? (
            <div className="flex h-48 sm:h-56 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
          ) : monthlyRevenue.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={monthlyRevenue}
                  barCategoryGap="30%"
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#6b6b80' }}
                    axisLine={false}
                    tickLine={false}
                    interval={tickInterval}
                    dy={6}
                  />
                  <YAxis
                    width={48}
                    tick={{ fontSize: 10, fill: '#6b6b80' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => {
                      const r = v / 100
                      if (r === 0) return '₹0'
                      if (r >= 100000) return `₹${(r / 100000).toFixed(1)}L`
                      if (r >= 1000) return `₹${(r / 1000).toFixed(0)}K`
                      return `₹${r}`
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={44}>
                    {monthlyRevenue.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === monthlyRevenue.length - 1
                            ? '#a855f7'
                            : Number(entry.revenue) === 0
                              ? 'rgba(124,58,237,0.12)'
                              : '#7c3aed55'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Divider */}
              <div className="my-4 sm:my-5 h-px bg-white/[0.04]" />

              {/* Stats row */}
              <RevenueStats data={monthlyRevenue} />
            </>
          ) : (
            <div className="flex h-48 sm:h-56 items-center justify-center text-[13px] text-muted-foreground">
              No revenue data yet
            </div>
          )}
        </div>

        {/* ── Expiring members ── */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 lg:col-span-1">
          <p className="mb-1 text-[13px] font-semibold text-foreground">Expiring members</p>
          <p className="mb-4 text-[11px] text-muted-foreground">Members expiring within 7 days</p>
          {expiringMembers?.length > 0 ? (
            <div className="divide-y divide-white/[0.04]">
              {expiringMembers.slice(0, 5).map((m: any) => (
                <ExpiringMemberRow key={m.id} name={m.name} daysLeft={m.daysLeft ?? 0} />
              ))}
            </div>
          ) : (
            <div className="flex h-36 items-center justify-center text-[13px] text-muted-foreground">
              No expiring members
            </div>
          )}
        </div>

        {/* ── Recent activity ── */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 lg:col-span-1">
          <p className="mb-1 text-[13px] font-semibold text-foreground">Recent activity</p>
          <p className="mb-3 text-[11px] text-muted-foreground">Latest payments & check-ins</p>

          {recentActivity?.recentPayments?.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                <IndianRupee size={10} /> Payments
              </p>
              {recentActivity.recentPayments.slice(0, 3).map((p: any) => (
                <ActivityItem
                  key={p.id}
                  name={p.member?.name ?? 'Unknown'}
                  action="paid"
                  amount={toRupees(p.finalAmount)}
                  time={new Date(p.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit', minute: '2-digit',
                  })}
                  type="payment"
                />
              ))}
            </div>
          )}

          {recentActivity?.recentAttendance?.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                <Activity size={10} /> Attendance
              </p>
              {recentActivity.recentAttendance.slice(0, 3).map((a: any) => (
                <ActivityItem
                  key={a.id}
                  name={a.member?.name ?? 'Unknown'}
                  action="checked in"
                  time={new Date(a.checkInAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit', minute: '2-digit',
                  })}
                  type="checkin"
                />
              ))}
            </div>
          )}

          {!recentActivity?.recentPayments?.length &&
            !recentActivity?.recentAttendance?.length && (
              <div className="flex h-36 items-center justify-center text-[13px] text-muted-foreground">
                No recent activity
              </div>
            )}
        </div>

      </div>
    </div>
  )
}