'use client'

import { useState, useEffect } from 'react'
import api from '@/src/lib/memberApi'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Scale, Utensils, Plus, Flame, ChevronDown, ChevronUp,
  TrendingDown, TrendingUp, Minus, Loader2, Calendar, User,
  CheckCircle2, AlertCircle, Dumbbell, Clock, CheckCircle,
  XCircle, UserCheck,
} from 'lucide-react'
import { format, parseISO, isToday, isFuture } from 'date-fns'
import React, { memo } from 'react'
import { useMemberDietStore } from '@/src/store/memberDietStore'
// ─── Types ───────────────────────────────────────────────
interface Meal { id: string; time: string; items: string[]; calories: number | null }
interface DietPlan {
  id: string; title: string; description: string | null; notes: string | null
  validFrom: string; validTo: string | null; meals: Meal[]
  createdBy: { name: string; role: string }
}
interface WeightEntry { id: string; weight: number; notes: string | null; loggedAt: string }
interface WeightSummary { latest: number | null; oldest: number | null; change: number | null; totalEntries: number }
interface PtSession {
  id: string; scheduledAt: string; status: string; notes: string | null
  trainer: { id: string; name: string }
}
interface PtEnrollment {
  id: string; totalSessions: number; usedSessions: number; remainingSessions: number
  status: string; startDate: string; expiryDate: string | null
  package: { name: string; sessions: number; price: number }
  sessions: PtSession[]
}

// ─── Config ───────────────────────────────────────────────
const mealConfig: Record<string, { color: string; bg: string; border: string }> = {
  Breakfast: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  Lunch: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  Dinner: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  'Pre-workout': { color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  'Post-workout': { color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  Snacks: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
}
const defaultMeal = { color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' }
const card = 'rounded-2xl border border-border bg-white/[0.03] p-5'
const inputBase = 'w-full bg-background/30 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-zinc-600 outline-none focus:border-violet-500/40 transition-colors'

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">{children}</p>
}

// ─── PT Session status config ─────────────────────────────
const sessionStatus: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
  SCHEDULED: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Clock, label: 'Scheduled' },
  COMPLETED: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle, label: 'Completed' },
  CANCELLED: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle, label: 'Cancelled' },
  NO_SHOW: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: AlertCircle, label: 'No Show' },
}

// ─── PT Enrollment card ───────────────────────────────────
function PtEnrollmentCard({ enrollment }: { enrollment: PtEnrollment }) {
  const [open, setOpen] = useState(false)
  const pct = Math.round((enrollment.usedSessions / enrollment.totalSessions) * 100)
  const upcoming = enrollment.sessions.filter(s => s.status === 'SCHEDULED' && isFuture(parseISO(s.scheduledAt)))
  const past = enrollment.sessions.filter(s => s.status !== 'SCHEDULED' || !isFuture(parseISO(s.scheduledAt)))

  return (
    <div className="rounded-xl border border-white/[0.07] bg-background/20 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-4 py-3.5 flex items-start justify-between gap-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-foreground">{enrollment.package.name}</p>
            <span className={cn(
              'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
              enrollment.status === 'ACTIVE'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
            )}>
              {enrollment.status}
            </span>
          </div>
          {/* Progress bar */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground flex-shrink-0">
              {enrollment.usedSessions}/{enrollment.totalSessions} sessions
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[11px] text-violet-400 font-medium">
              {enrollment.remainingSessions} remaining
            </span>
            {enrollment.expiryDate && (
              <span className="text-[11px] text-zinc-600 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Expires {format(parseISO(enrollment.expiryDate), 'd MMM yyyy')}
              </span>
            )}
          </div>
        </div>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-1" />
          : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-1" />
        }
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-white/[0.05] pt-3 space-y-3">

          {/* Upcoming sessions */}
          {upcoming.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Upcoming
              </p>
              <div className="space-y-2">
                {upcoming.map(session => {
                  const s = sessionStatus[session.status] || sessionStatus.SCHEDULED
                  const Icon = s.icon
                  return (
                    <div key={session.id} className="flex items-center gap-3 rounded-xl border border-blue-500/15 bg-blue-500/5 px-3 py-2.5">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-3.5 w-3.5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">
                          {format(parseISO(session.scheduledAt), 'EEEE, d MMM yyyy')}
                        </p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <UserCheck className="h-3 w-3" />
                          {session.trainer.name}
                          <span className="mx-1">·</span>
                          {format(parseISO(session.scheduledAt), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Past sessions */}
          {past.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Past sessions
              </p>
              <div className="space-y-1.5">
                {past.map(session => {
                  const s = sessionStatus[session.status] || sessionStatus.SCHEDULED
                  const Icon = s.icon
                  return (
                    <div key={session.id} className={cn(
                      'flex items-center gap-3 rounded-xl border px-3 py-2',
                      s.bg, s.border
                    )}>
                      <Icon className={cn('h-3.5 w-3.5 flex-shrink-0', s.color)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">
                          {format(parseISO(session.scheduledAt), 'd MMM yyyy · h:mm a')}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{session.trainer.name}</p>
                      </div>
                      <span className={cn('text-[10px] font-semibold', s.color)}>{s.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {enrollment.sessions.length === 0 && (
            <p className="text-xs text-zinc-600 text-center py-4">
              No sessions scheduled yet
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Diet plan card ───────────────────────────────────────
function DietPlanCard({ plan }: { plan: DietPlan }) {
  const [open, setOpen] = useState(false)
  const totalCal = plan.meals.reduce((s, m) => s + (m.calories ?? 0), 0)

  return (
    <div className="rounded-xl border border-white/[0.07] bg-background/20 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-4 py-3.5 flex items-start justify-between gap-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">{plan.title}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />{plan.createdBy.name}
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(parseISO(plan.validFrom), 'd MMM yyyy')}
              {plan.validTo && ` — ${format(parseISO(plan.validTo), 'd MMM yyyy')}`}
            </span>
            {totalCal > 0 && (
              <span className="text-[11px] text-orange-400 flex items-center gap-1">
                <Flame className="h-3 w-3" />{totalCal} kcal/day
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 pt-0.5 flex-shrink-0">
          <span className="text-[11px] text-zinc-600 bg-white/[0.04] px-2 py-0.5 rounded-md">
            {plan.meals.length} meals
          </span>
          {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2.5 border-t border-white/[0.05] pt-3">
          {plan.description && <p className="text-xs text-zinc-400 italic mb-3">{plan.description}</p>}
          {plan.meals.map(meal => {
            const mc = mealConfig[meal.time] || defaultMeal
            return (
              <div key={meal.id} className="rounded-xl border border-white/[0.05] bg-background/20 p-3">
                <div className="flex items-center justify-between mb-2.5">
                  <span className={cn('text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border', mc.color, mc.bg, mc.border)}>
                    {meal.time}
                  </span>
                  {meal.calories && (
                    <span className="text-[11px] text-orange-400/80 flex items-center gap-1">
                      <Flame className="h-3 w-3" />{meal.calories} kcal
                    </span>
                  )}
                </div>
                <ul className="space-y-1.5">
                  {meal.items.map((item, i) => (
                    <li key={i} className="text-xs text-zinc-300 flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-zinc-600 flex-shrink-0 mt-px" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
          {plan.notes && (
            <p className="text-xs text-muted-foreground border-t border-white/[0.05] pt-3 mt-1">
              <span className="text-zinc-400 font-medium">Trainer note:</span> {plan.notes}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Log weight form ──────────────────────────────────────
function LogWeightForm({ onSuccess }: { onSuccess: () => void }) {
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [logged, setLogged] = useState(false)
  const [error, setError] = useState('')

  const handleLog = async () => {
    setError('')
    const w = parseFloat(weight)
    if (!weight || isNaN(w)) { setError('Enter a valid weight'); return }
    if (w < 20 || w > 300) { setError('Weight must be between 20 and 300 kg'); return }
    setSaving(true)
    try {
      await api.post('/api/members/portal/weight', { weight: w, notes: notes.trim() || undefined })
      toast.success('Weight logged! Keep it up 💪')
      setWeight(''); setNotes('')
      setLogged(true)
      setTimeout(() => setLogged(false), 3000)
      onSuccess()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to log weight')
    } finally { setSaving(false) }
  }

  return (
    <div className={card}>
      <Label>Log today's weight</Label>
      <div className="space-y-3">
        <div className="relative">
          <input
            type="number" step="0.1" min="20" max="300" placeholder="72.5"
            value={weight}
            onChange={e => { setWeight(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleLog()}
            className={cn(inputBase, 'pr-12 text-2xl font-semibold tracking-tight', error && 'border-red-500/40')}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium select-none">kg</span>
        </div>
        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1.5">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />{error}
          </p>
        )}
        <input className={inputBase} placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
        <button
          onClick={handleLog} disabled={saving || !weight}
          className="w-full h-10 rounded-xl text-sm font-medium text-foreground flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          style={{ background: logged ? '#16a34a' : 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" />
            : logged ? <><CheckCircle2 className="h-4 w-4" /> Logged!</>
              : <><Plus className="h-4 w-4" /> Log weight</>
          }
        </button>
      </div>
    </div>
  )
}



// ─── Main page ────────────────────────────────────────────
export default function MemberDietPage() {
  const diets =
  useMemberDietStore(
    state => state.diets
  )

const ptEnrollments =
  useMemberDietStore(
    state => state.ptEnrollments
  )

const weightData =
  useMemberDietStore(
    state => state.weightData
  )

const loaded =
  useMemberDietStore(
    state => state.loaded
  )

const setData =
  useMemberDietStore(
    state => state.setData
  )
  const [loading, setLoading] = useState(true)

  const refreshWeights = async () => {
    try {
      const profileRes =
        await api.get('/api/members/portal/profile')

      const memberId =
        profileRes.data.data.id

      const weightRes =
        await api.get(
          `/api/members/${memberId}/weights`
        )

      setData({
        diets,
        ptEnrollments,
        weightData: weightRes.data.data
      })
    } catch {
      toast.error(
        'Failed to refresh weights'
      )
    }
  }

  const fetchAll = async () => {
    try {
      const profileRes = await api.get('/api/members/portal/profile')
      const profile = profileRes.data.data
      const memberId = profile.id

      const [dietRes, weightRes] = await Promise.all([
        api.get(`/api/members/${memberId}/diet`),
        api.get(`/api/members/${memberId}/weights`),
      ])

      setData({
        diets: dietRes.data.data,
        weightData: weightRes.data.data,
        ptEnrollments: profile.ptEnrollments ?? []
      })
    } catch {
      toast.error('Failed to load your data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {

  if (loaded) {
    setLoading(false)
    return
  }

  fetchAll()

}, [loaded])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">

        <div className="h-32 rounded-2xl bg-white/[0.04]" />

        <div className="h-40 rounded-2xl bg-white/[0.04]" />

        <div className="h-40 rounded-2xl bg-white/[0.04]" />

      </div>
    )
  }

  const entries = weightData?.entries ?? []
  const summary = weightData?.summary ?? null
  const change = summary?.change ?? null
  const changeColor = change === null ? 'text-muted-foreground' : change < 0 ? 'text-emerald-400' : change > 0 ? 'text-red-400' : 'text-zinc-400'
  const ChangeIcon = change === null ? Minus : change < 0 ? TrendingDown : TrendingUp

  return (
    <div className="space-y-5 pb-10">

      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-foreground leading-tight">Diet &amp; weight</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Track your progress and follow your trainer's plan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── LEFT — Weight ── */}
        <div className="space-y-4">
          <LogWeightForm onSuccess={refreshWeights} />

          {/* Progress summary */}
          <div className={card}>
            <Label>Progress</Label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="rounded-xl bg-background/20 border border-border p-3 text-center">
                <p className="text-xl font-semibold text-foreground leading-none mb-1">{summary?.latest ?? '—'}</p>
                <p className="text-[10px] text-muted-foreground">Now (kg)</p>
              </div>
              <div className="rounded-xl bg-background/20 border border-border p-3 text-center">
                <p className="text-xl font-semibold text-foreground leading-none mb-1">{summary?.oldest ?? '—'}</p>
                <p className="text-[10px] text-muted-foreground">Start (kg)</p>
              </div>
              <div className="rounded-xl bg-background/20 border border-border p-3 text-center">
                <p className={cn('text-xl font-semibold leading-none mb-1 flex items-center justify-center gap-0.5', changeColor)}>
                  <ChangeIcon className="h-4 w-4" />
                  {change !== null ? Math.abs(change) : '—'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {change === null ? 'Change' : change < 0 ? 'Lost kg' : change > 0 ? 'Gained' : 'Stable'}
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-600 flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5" />
              {summary?.totalEntries ?? 0} entries logged
            </p>
          </div>

          {/* Weight history */}
          <div className={card}>
            <Label>History</Label>
            {entries.length === 0 ? (
              <div className="py-6 flex flex-col items-center gap-2 text-zinc-600">
                <Scale className="h-6 w-6" />
                <p className="text-xs text-center">No entries yet.<br />Log your first weight above!</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {entries.map((entry: WeightEntry, idx: number) => {
                  const prev = entries[idx + 1]?.weight
                  const diff = prev !== undefined ? +(entry.weight - prev).toFixed(1) : null
                  const fresh = isToday(parseISO(entry.loggedAt))
                  return (
                    <div key={entry.id} className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl border',
                      fresh ? 'border-violet-500/20 bg-violet-500/5' : 'border-white/[0.05] bg-background/20'
                    )}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                          {entry.weight} kg
                          {fresh && <span className="text-[10px] text-violet-400 /10 border border-violet-500/20 px-1.5 py-0.5 rounded bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground">Today</span>}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{format(parseISO(entry.loggedAt), 'd MMM yyyy')}</p>
                      </div>
                      {diff !== null && diff !== 0 && (
                        <span className={cn('text-[11px] font-medium', diff < 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {diff > 0 ? '+' : ''}{diff} kg
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT — Diet + PT ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Diet plans */}
          <div className={card}>
            <div className="flex items-center justify-between mb-4">
              <Label>Your diet plan</Label>
              <span className="text-[11px] text-zinc-600 bg-white/[0.04] px-2 py-0.5 rounded-md">
                {diets.length} {diets.length === 1 ? 'plan' : 'plans'}
              </span>
            </div>
            {diets.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-3 text-zinc-600">
                <div className="h-12 w-12 rounded-2xl /10 flex items-center justify-center bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground">
                  <Utensils className="h-5 w-5 text-violet-400/60" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">No diet plan yet</p>
                  <p className="text-xs text-zinc-600 mt-1">Your trainer will add a diet plan for you soon</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {diets.map(plan => <MemoDietPlanCard key={plan.id} plan={plan} />)}
              </div>
            )}
          </div>

          {/* PT Sessions */}
          <div className={card}>
            <div className="flex items-center justify-between mb-4">
              <Label>Personal training</Label>
              <span className="text-[11px] text-zinc-600 bg-white/[0.04] px-2 py-0.5 rounded-md">
                {ptEnrollments.length} {ptEnrollments.length === 1 ? 'package' : 'packages'}
              </span>
            </div>
            {ptEnrollments.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-3 text-zinc-600">
                <div className="h-12 w-12 rounded-2xl /10 flex items-center justify-center bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground">
                  <Dumbbell className="h-5 w-5 text-violet-400/60" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">No PT package yet</p>
                  <p className="text-xs text-zinc-600 mt-1">Ask your gym to enroll you in a personal training package</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {ptEnrollments.map(e => <MemoPtEnrollmentCard key={e.id} enrollment={e} />)}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

const MemoDietPlanCard =
  memo(DietPlanCard)

const MemoPtEnrollmentCard =
  memo(PtEnrollmentCard)