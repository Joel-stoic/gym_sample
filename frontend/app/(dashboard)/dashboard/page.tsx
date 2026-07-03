'use client'

import { useState } from 'react'
import {
  Users, UserCheck, UserX, IndianRupee,
  CalendarCheck, TrendingUp, AlertCircle, Activity,
} from 'lucide-react'
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from 'recharts'
import { motion, useAnimation, useInView, animate, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useDashboard, type RevenueMonths } from '@/src/hooks/useDashboard'
import { toRupees } from '@/src/lib/utils'

// ─── Skeleton ─────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-secondary ${className}`} />
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
    <div className="min-h-screen space-y-5 bg-background">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {[...Array(5)].map((_, i) => <MetricCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => <MetricCardSkeleton key={i} />)}
      </div>
    </div>
  )
}

// ─── Animated Counter ──────────────────────────────────────────────────
function AnimatedCounter({ value }: { value: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = nodeRef.current
    if (node) {
      const controls = animate(0, value, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate(v) {
          if (node) {
            node.textContent = Math.round(v).toLocaleString()
          }
        },
      })
      return () => controls.stop()
    }
  }, [value])

  return <span ref={nodeRef}>{value.toLocaleString()}</span>
}

// ─── Metric Card ──────────────────────────────────────────────────────
function MetricCard({
  title, value, sub, icon: Icon, accent = false, className = '', isCurrency = false
}: {
  title: string
  value: number
  sub?: string
  icon: React.ElementType
  accent?: boolean
  className?: string
  isCurrency?: boolean
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 ${accent ? 'gradient-border-card' : 'glass-panel'} ${className}`}>
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${accent ? 'bg-accent text-primary glow-primary shadow-lg' : 'bg-secondary text-foreground'}`}>
        <Icon size={18} />
      </div>
      <p className="text-[28px] sm:text-[34px] font-light tabular-nums text-foreground tracking-tight">
        {isCurrency ? '₹' : ''}
        <AnimatedCounter value={value} />
      </p>
      {sub && <p className="mt-1 text-[12px] text-muted-foreground">{sub}</p>}
      <p className="mt-3 sm:mt-4 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{title}</p>
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
    <div className="flex gap-1 rounded-lg border border-border bg-secondary p-1">
      {RANGE_OPTIONS.map(({ label, months }) => (
        <button
          key={months}
          onClick={() => onChange(months)}
          className={`rounded-md px-2.5 sm:px-3 py-1 text-[11px] font-semibold transition-all duration-150 ${value === months
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
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
      <div className="rounded-xl border border-border bg-card px-3 py-2 text-[12px] shadow-sm">
        <p className="text-muted-foreground font-semibold">{label}</p>
        <p className="mt-1 font-semibold text-primary">{toRupees(payload[0].value)}</p>
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
    <div className="flex gap-2 sm:gap-3 pb-1">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-1 flex-col gap-1.5 rounded-xl border border-border bg-secondary px-3 sm:px-4 py-3 sm:py-3.5"
        >
          <span className="text-[12px] sm:text-[14px] font-semibold text-foreground">{value}</span>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">{label}</span>
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
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-[11px] font-bold ${isCritical ? 'bg-secondary text-foreground' : 'bg-accent text-primary'
        }`}>
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-foreground">{name}</p>
        <p className="text-[11px] text-muted-foreground">
          {daysLeft === 0 ? 'Expires today' : `Expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`}
        </p>
      </div>
      <span className={`flex-shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${isCritical
          ? 'border-border bg-secondary text-muted-foreground'
          : 'border-primary/20 bg-accent text-primary'
        }`}>
        {isCritical ? 'Critical' : 'Soon'}
      </span>
    </div>
  )
}

// ─── Activity Item ────────────────────────────────────────────────────
function ActivityItem({
  name, action, amount, time,
}: {
  name: string; action: string; amount?: string; time: string; type: 'payment' | 'checkin'
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-0">
      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
      <p className="flex-1 text-[12px] text-muted-foreground">
        <span className="font-medium text-foreground">{name}</span>{' '}
        {action}
        {amount && <span className="ml-1 font-medium text-primary">{amount}</span>}
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

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, position: 'absolute', width: '100%' }}>
          <DashboardSkeleton />
        </motion.div>
      ) : error ? (
        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="flex h-64 items-center justify-center gap-2 text-foreground">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="content" 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="min-h-screen space-y-4 sm:space-y-5"
        >

      {/* ── Top Bento Grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Members"
          value={metrics?.members?.total ?? 0}
          sub={`+${metrics?.members?.newThisMonth ?? 0} new this month`}
          icon={Users}
          className="lg:col-span-1"
        />
        <MetricCard
          title="Active Members"
          value={metrics?.members?.active ?? 0}
          sub={`${metrics?.members?.total
            ? Math.round(((metrics.members.active ?? 0) / metrics.members.total) * 100)
            : 0}% retention`}
          icon={UserCheck}
          accent
          className="lg:col-span-1"
        />
        <MetricCard
          title="Today's Attendance"
          value={metrics?.attendance?.today ?? 0}
          sub="check-ins today"
          icon={CalendarCheck}
          className="lg:col-span-1"
        />
        <div className="grid grid-rows-2 gap-4 lg:col-span-1">
          <MetricCard
            title="Expired"
            value={metrics?.members?.expired ?? 0}
            icon={UserX}
            className="p-4"
          />
          <MetricCard
            title="Renewing"
            value={metrics?.members?.expiringThisWeek ?? 0}
            icon={TrendingUp}
            className="p-4"
          />
        </div>
      </div>

      {/* ── Revenue metric cards ── */}
      {metrics?.revenue && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard
            title="Membership Revenue"
            value={metrics.revenue.thisMonth ?? 0}
            sub="this month"
            icon={IndianRupee}
            isCurrency
          />
          <MetricCard
            title="PT Revenue"
            value={metrics.revenue.ptThisMonth ?? 0}
            sub="personal training"
            icon={IndianRupee}
            isCurrency
          />
          <MetricCard
            title="Total Revenue"
            value={metrics.revenue.totalThisMonth ?? 0}
            sub="membership + PT"
            icon={IndianRupee}
            accent
            isCurrency
            className="lg:col-span-2"
          />
        </div>
      )}

      {/* ── Bottom section ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">

        {/* ── Revenue chart ── */}
        <div className="glass-panel p-4 sm:p-6 lg:col-span-2 rounded-2xl relative overflow-hidden">
          {/* Subtle glow behind chart */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="mb-5 sm:mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-[18px] md:text-[20px] font-medium text-foreground">Monthly Revenue</p>
              <p className="mt-0.5 text-[11px] sm:text-[12px] text-muted-foreground">Membership + PT earnings over time</p>
            </div>
            <RevenueRangeToggle value={revenueRange} onChange={setRevenueRange} />
          </div>

          {chartLoading ? (
            <div className="flex h-48 sm:h-56 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : monthlyRevenue.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart
                  data={monthlyRevenue}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#8C8D95', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    interval={tickInterval}
                    dy={6}
                  />
                  <YAxis
                    width={48}
                    tick={{ fontSize: 10, fill: '#8C8D95', fontWeight: 600 }}
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
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="var(--primary)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="my-4 sm:my-5 h-px bg-border" />
              <RevenueStats data={monthlyRevenue} />
            </>
          ) : (
            <div className="flex h-48 sm:h-56 items-center justify-center text-[13px] text-muted-foreground font-medium">
              No revenue data yet
            </div>
          )}
        </div>

        {/* ── Expiring members ── */}
        <div className="glass-panel p-4 sm:p-5 lg:col-span-1 rounded-2xl">
          <p className="mb-1 text-[18px] md:text-[20px] font-medium text-foreground">Expiring members</p>
          <p className="mb-4 text-[11px] text-muted-foreground">Members expiring within 7 days</p>
          {expiringMembers?.length > 0 ? (
            <div className="divide-y divide-border">
              {expiringMembers.slice(0, 5).map((m: any) => (
                <ExpiringMemberRow key={m.id} name={m.name} daysLeft={m.daysLeft ?? 0} />
              ))}
            </div>
          ) : (
            <div className="flex h-36 items-center justify-center text-[13px] text-muted-foreground font-medium">
              No expiring members
            </div>
          )}
        </div>

        {/* ── Recent activity ── */}
        <div className="glass-panel p-4 sm:p-5 lg:col-span-1 rounded-2xl">
          <p className="mb-1 text-[18px] md:text-[20px] font-medium text-foreground">Recent activity</p>
          <p className="mb-3 text-[11px] text-muted-foreground">Latest payments & check-ins</p>

          {recentActivity?.recentPayments?.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
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
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
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
              <div className="flex h-36 items-center justify-center text-[13px] text-muted-foreground font-medium">
                No recent activity
              </div>
            )}
        </div>

      </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}