'use client'

import { useState, useEffect } from 'react'
import api from '@/src/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/src/store/authStore'
import {
  Dumbbell, Plus, Clock, CheckCircle, XCircle, AlertCircle,
  UserCheck, Calendar, Search, Loader2, Users, Activity, Package,
} from 'lucide-react'
import { format, parseISO, isFuture } from 'date-fns'
import { useDashboardStore } from '@/src/store/dashboardStore'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PtSession {
  id: string
  scheduledAt: string
  status: string
  notes: string | null
  conductedAt: string | null
  member: { id: string; name: string; phone: string }
  trainer: { id: string; name: string }
  enrollment: { id: string; package: { name: string } }
}

interface PtPackage {
  id: string
  name: string
  sessions: number
  price: number
  durationDays: number | null
  description: string | null
}

interface PtEnrollment {
  id: string
  totalSessions: number
  usedSessions: number
  remainingSessions: number
  status: string
  startDate: string
  expiryDate: string | null
  amountPaid: number
  member: { id: string; name: string; phone: string }
  package: { id: string; name: string; sessions: number; price: number }
  sessions: PtSession[]
}

interface StaffMember {
  id: string
  name: string
  role: string
}

// ─── Design tokens (matches your existing app) ────────────────────────────────

const surface = { background: 'var(--background)', border: '1px solid var(--border)' }

const inp = `
  w-full rounded-xl px-3 py-2.5 text-[13px] text-foreground outline-none transition-all
  placeholder:text-muted-foreground
`
const inpStyle = { background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }

const card = 'rounded-2xl p-5'

// ─── Session status config ────────────────────────────────────────────────────

const statusCfg: Record<string, {
  color: string; bg: string; border: string; icon: any; label: string
}> = {
  SCHEDULED: { color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', icon: Clock, label: 'Scheduled' },
  COMPLETED: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle, label: 'Completed' },
  CANCELLED: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle, label: 'Cancelled' },
  NO_SHOW: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: AlertCircle, label: 'No Show' },
}

// ─── Add Package Modal ────────────────────────────────────────────────────────

function AddPackageModal({ onClose, onSuccess }: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [sessions, setSessions] = useState('')
  const [price, setPrice] = useState('')
  const [durationDays, setDuration] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Package name is required'); return }
    if (!sessions || Number(sessions) < 1) { toast.error('Enter number of sessions'); return }
    if (!price || Number(price) < 0) { toast.error('Enter package price'); return }
    setSaving(true)
    try {
      await api.post('/api/pt/packages', {
        name,
        sessions: Number(sessions),
        price: Number(price),
        durationDays: durationDays ? Number(durationDays) : undefined,
        description: description || undefined,
      })
      toast.success('Package created!')
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create package')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card">
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-[15px] font-semibold text-foreground">New PT Package</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none">✕</button>
        </div>
        <div className="p-6 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Package Name</label>
            <input className={inp} style={inpStyle} placeholder="e.g. Premium 20 Sessions"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Sessions</label>
              <input type="number" className={inp} style={inpStyle} placeholder="20"
                value={sessions} onChange={e => setSessions(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Price (₹)</label>
              <input type="number" className={inp} style={inpStyle} placeholder="5000"
                value={price} onChange={e => setPrice(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Validity (days, optional)</label>
            <input type="number" className={inp} style={inpStyle} placeholder="90"
              value={durationDays} onChange={e => setDuration(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Description (optional)</label>
            <input className={inp} style={inpStyle} placeholder="Brief description..."
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-[13px] font-medium transition-all duration-150 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 text-foreground hover:-translate-y-0.5 mt-2 disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Creating...' : 'Create Package'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Schedule Session Modal ───────────────────────────────────────────────────

function ScheduleSessionModal({ enrollments, trainers, onClose, onSuccess }: {
  enrollments: PtEnrollment[]
  trainers: StaffMember[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [enrollmentId, setEnrollmentId] = useState('')
  const [selectedLabel, setSelectedLabel] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [filteredEnrollments, setFilteredEnrollments] = useState<PtEnrollment[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [trainerId, setTrainerId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSearch = (val: string) => {
    setMemberSearch(val)
    setEnrollmentId('')
    setSelectedLabel('')
    if (val.length < 1) { setFilteredEnrollments([]); setShowDropdown(false); return }
    const results = enrollments.filter(e =>
      e.status === 'ACTIVE' &&
      e.remainingSessions > 0 &&
      (e.member.name.toLowerCase().includes(val.toLowerCase()) ||
        e.member.phone.includes(val))
    )
    setFilteredEnrollments(results)
    setShowDropdown(true)
  }

  const handleSave = async () => {
    if (!enrollmentId) { toast.error('Select a member enrollment'); return }
    if (!trainerId) { toast.error('Select a trainer'); return }
    if (!date) { toast.error('Select a date'); return }
    const dt = new Date(`${date}T${time}:00`)
    if (dt <= new Date()) { toast.error('Session must be in the future'); return }
    setSaving(true)
    try {
      await api.post('/api/pt/sessions', {
        enrollmentId, trainerId,
        scheduledAt: dt.toISOString(),
        notes: notes || undefined,
      })
      toast.success('Session scheduled!')
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to schedule session')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card" >
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-[15px] font-semibold text-foreground">Schedule PT Session</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none">✕</button>
        </div>
        <div className="p-6 space-y-3">

          {/* Member search */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Member & Package</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                className={cn(inp, 'pl-9')} style={inpStyle}
                placeholder="Search by name or phone..."
                value={enrollmentId ? selectedLabel : memberSearch}
                onChange={e => handleSearch(e.target.value)}
              />
            </div>
            {showDropdown && filteredEnrollments.length > 0 && (
              <div className="mt-1 rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                style={{ background: '#0d0d14', border: '1px solid var(--border)' }}>
                {filteredEnrollments.map(e => (
                  <button key={e.id}
                    onClick={() => {
                      setEnrollmentId(e.id)
                      setSelectedLabel(`${e.member.name} — ${e.package.name} (${e.remainingSessions} left)`)
                      setShowDropdown(false)
                      setMemberSearch('')
                    }}
                    className="w-full px-3 py-2.5 text-left border-b border-white/[0.05] last:border-0 transition-colors"
                    style={{ background: 'transparent' }}
                    onMouseEnter={ev => (ev.currentTarget.style.background = '#ffffff05')}
                    onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}>
                    <p className="text-[13px] text-foreground">{e.member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.package.name} · {e.remainingSessions} sessions left · {e.member.phone}
                    </p>
                  </button>
                ))}
              </div>
            )}
            {showDropdown && filteredEnrollments.length === 0 && (
              <p className="text-xs text-orange-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> No active enrollments found
              </p>
            )}
          </div>

          {/* Trainer */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Trainer</label>
            <select value={trainerId} onChange={e => setTrainerId(e.target.value)}
              className={cn(inp, 'cursor-pointer')} style={inpStyle}>
              <option value="">Select trainer...</option>
              {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={cn(inp, 'cursor-pointer')} style={inpStyle} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className={inp} style={inpStyle} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Notes (optional)</label>
            <input className={inp} style={inpStyle} placeholder="Any notes..."
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-[13px] font-medium transition-all duration-150 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 text-foreground hover:-translate-y-0.5 mt-2 disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Scheduling...' : 'Schedule Session'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Enroll Member Modal ──────────────────────────────────────────────────────

function EnrollMemberModal({ packages, onClose, onSuccess }: {
  packages: PtPackage[]   // ← always an array, guaranteed by fetchAll fix
  onClose: () => void
  onSuccess: () => void
}) {
  const [memberSearch, setMemberSearch] = useState('')
  const [members, setMembers] = useState<any[]>([])
  const [memberId, setMemberId] = useState('')
  const [selectedMemberName, setSelectedMember] = useState('')
  const [packageId, setPackageId] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [startDate, setStartDate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!memberSearch || memberSearch.length < 2) { setMembers([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await api.get(`/api/members?search=${memberSearch}&limit=10`)
        setMembers(res.data.data?.members ?? [])
      } catch { } finally { setSearching(false) }
    }, 400)
    return () => clearTimeout(t)
  }, [memberSearch])

  // ✅ packages is always an array — .find() is safe
  const selectedPkg = Array.isArray(packages)
    ? packages.find(p => p.id === packageId)
    : undefined

  const handleSave = async () => {
    if (!memberId) { toast.error('Select a member'); return }
    if (!packageId) { toast.error('Select a package'); return }
    if (!amountPaid) { toast.error('Enter amount paid'); return }
    setSaving(true)
    try {
      await api.post('/api/pt/enroll', {
        memberId, packageId,
        amountPaid: Number(amountPaid),
        notes: notes || undefined,
        startDate: startDate || undefined,
      })
      toast.success('Member enrolled in PT package!')
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to enroll member')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md rounded-2xl max-h-[90vh] overflow-y-auto border border-border bg-card"
        >
        <div className="sticky top-0 px-6 py-4 flex items-center justify-between border-b border-border bg-card"
          >
          <h2 className="text-[15px] font-semibold text-foreground">Enroll Member in PT</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none">✕</button>
        </div>
        <div className="p-6 space-y-3">

          {/* Member search */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Search Member</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                className={cn(inp, 'pl-9')} style={inpStyle}
                placeholder="Type name or phone..."
                value={memberId ? selectedMemberName : memberSearch}
                onChange={e => {
                  setMemberSearch(e.target.value)
                  setMemberId('')
                  setSelectedMember('')
                }}
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />
              )}
            </div>
            {members.length > 0 && !memberId && (
              <div className="mt-1 rounded-xl overflow-hidden" style={{ background: '#0d0d14', border: '1px solid var(--border)' }}>
                {members.map(m => (
                  <button key={m.id}
                    onClick={() => { setMemberId(m.id); setSelectedMember(m.name); setMembers([]) }}
                    className="w-full px-3 py-2.5 text-left transition-colors border-b border-white/[0.05] last:border-0"
                    style={{ background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#ffffff05')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <p className="text-[13px] text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.phone}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Package select */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">PT Package</label>
            <select value={packageId}
              onChange={e => {
                setPackageId(e.target.value)
                // ✅ safe because packages is always an array
                const p = Array.isArray(packages) ? packages.find(x => x.id === e.target.value) : undefined
                if (p) setAmountPaid(String(p.price))
              }}
              className={cn(inp, 'cursor-pointer')} style={inpStyle}>
              <option value="">Select package...</option>
              {Array.isArray(packages) && packages.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.sessions} sessions (₹{p.price.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Amount Paid (₹)</label>
            <input type="number" className={inp} style={inpStyle} placeholder="0"
              value={amountPaid} onChange={e => setAmountPaid(e.target.value)} />
            {selectedPkg && amountPaid && Number(amountPaid) < selectedPkg.price && (
              <p className="text-xs text-orange-400 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                ₹{(selectedPkg.price - Number(amountPaid)).toLocaleString('en-IN')} less than package price
              </p>
            )}
          </div>

          {/* Start date */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Start Date (optional)</label>
            <input type="date" className={cn(inp, 'cursor-pointer')} style={inpStyle}
              value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Notes (optional)</label>
            <input className={inp} style={inpStyle} placeholder="Any notes..."
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <button onClick={handleSave} disabled={saving || !memberId || !packageId}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-[13px] font-medium transition-all duration-150 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 text-foreground hover:-translate-y-0.5 mt-2 disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Enrolling...' : 'Enroll Member'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Session Row ──────────────────────────────────────────────────────────────

function SessionRow({ session, onComplete, onCancel, isTrainer }: {
  session: PtSession
  onComplete: (id: string) => void
  onCancel: (id: string) => void
  isTrainer: boolean
}) {
  const s = statusCfg[session.status] || statusCfg.SCHEDULED
  const Icon = s.icon
  const isUpcoming = session.status === 'SCHEDULED' && isFuture(parseISO(session.scheduledAt))

  return (
    <div className={cn('flex items-center gap-4 rounded-2xl border bg-background/50 backdrop-blur-sm px-5 py-4 transition-all hover:bg-background/80 shadow-sm', s.border)}>
      <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0', s.bg)}>
        <Icon className={cn('h-5 w-5', s.color)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[14px] font-semibold text-foreground">{session.member.name}</p>
          <span className="text-muted-foreground hidden sm:inline">·</span>
          <p className="text-[13px] text-muted-foreground">{session.enrollment.package.name}</p>
        </div>
        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
          <span className="text-[12px] text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 opacity-70" />
            {format(parseISO(session.scheduledAt), 'EEE, d MMM • h:mm a')}
          </span>
          <span className="text-[12px] text-muted-foreground flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 opacity-70" />
            {session.trainer.name}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={cn(
          'text-[11px] font-semibold px-3 py-1 rounded-full border hidden sm:inline-flex tracking-wide',
          s.color, s.bg, s.border
        )}>
          {s.label}
        </span>
        {isUpcoming && (
          <div className="flex items-center gap-2">
            <button onClick={() => onComplete(session.id)}
              className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-4 py-1.5 rounded-full transition-all hover:shadow-[0_0_10px_rgba(16,185,129,0.15)]">
              Complete
            </button>
            {!isTrainer && (
              <button onClick={() => onCancel(session.id)}
                className="text-[12px] font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-4 py-1.5 rounded-full transition-all">
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PtPage() {
  const { staff } = useAuthStore()
  const { resetDashboard } = useDashboardStore()
  const isTrainer = staff?.role === 'TRAINER'
  const isOwnerOrManager = staff?.role === 'OWNER' || staff?.role === 'MANAGER'

  const [sessions, setSessions] = useState<PtSession[]>([])
  const [enrollments, setEnrollments] = useState<PtEnrollment[]>([])
  const [packages, setPackages] = useState<PtPackage[]>([])
  const [trainers, setTrainers] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'sessions' | 'enrollments' | 'packages'>('sessions')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const [showSchedule, setShowSchedule] = useState(false)
  const [showEnroll, setShowEnroll] = useState(false)
  const [showPackage, setShowPackage] = useState(false)

  const fetchAll = async () => {
    try {
      const calls: Promise<any>[] = [
        api.get('/api/pt/sessions?limit=100'),
        api.get('/api/pt/packages'),
      ]
      if (isOwnerOrManager) calls.push(api.get('/api/staff?role=TRAINER'))
      const results = await Promise.all(calls)
      const [sessionsRes, packagesRes, trainerRes] = results
      setSessions(sessionsRes.data.data ?? [])
      setPackages(packagesRes.data.data ?? [])
      if (trainerRes) setTrainers(trainerRes.data.data ?? [])
    } catch {
      toast.error('Failed to load PT data')
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollments = async () => {
    try {
      const res = await api.get('/api/pt/enrollments')
      setEnrollments(res.data.data ?? [])
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load enrollments')
    }
  }

  useEffect(() => { fetchAll(); fetchEnrollments() }, [])

  const handleComplete = async (id: string) => {
    try {
      await api.patch(`/api/pt/sessions/${id}/complete`)
      toast.success('Session marked as completed')
      fetchAll()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete session')
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await api.patch(`/api/pt/sessions/${id}/cancel`, { reason: 'Cancelled by staff' })
      toast.success('Session cancelled')
      fetchAll()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel session')
    }
  }

  const filtered = statusFilter === 'ALL' ? sessions : sessions.filter(s => s.status === statusFilter)
  const upcoming = sessions.filter(s => s.status === 'SCHEDULED' && isFuture(parseISO(s.scheduledAt)))
  const completed = sessions.filter(s => s.status === 'COMPLETED').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <p className="text-[12px] text-muted-foreground">Loading PT data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-10" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Modals ── */}
      {showSchedule && (
        <ScheduleSessionModal
          enrollments={enrollments}
          trainers={trainers}
          onClose={() => setShowSchedule(false)}
          onSuccess={() => { fetchAll(); fetchEnrollments(); resetDashboard() }}
        />
      )}
      {showEnroll  && (
        <EnrollMemberModal
          packages={packages}
          onClose={() => setShowEnroll(false)}
          onSuccess={() => { fetchAll(); fetchEnrollments(); resetDashboard() }}
        />
      )}
      {showPackage && isOwnerOrManager && (
        <AddPackageModal
          onClose={() => setShowPackage(false)}
          onSuccess={fetchAll}
        />
      )}

      {/* ── Header Actions ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Tabs (Moved from below to the top left for better UX) */}
        <div className="inline-flex items-center gap-1 p-1 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md w-fit">
          {(['sessions', 'enrollments', 'packages'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 capitalize ${activeTab === tab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {tab === 'pt' ? 'Sessions' : tab}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setShowEnroll(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-full text-[13px] font-medium text-foreground bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 transition-all">
            <Users className="h-4 w-4" /> Enroll Member
          </button>
          
          {isOwnerOrManager && (
            <button onClick={() => setShowPackage(true)}
              className="flex items-center gap-2 h-10 px-4 rounded-full text-[13px] font-medium text-foreground bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 transition-all">
              <Package className="h-4 w-4" /> New Package
            </button>
          )}

          <button onClick={() => setShowSchedule(true)}
            className="flex items-center gap-2 h-10 px-5 rounded-full text-[13px] font-medium text-violet-600 dark:text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 backdrop-blur-md border border-violet-500/20 transition-all hover:shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <Plus className="h-4 w-4" /> Schedule Session
          </button>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Sessions', value: sessions.length, icon: Dumbbell, color: 'text-fuchsia-500 dark:text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
          { label: 'Upcoming', value: upcoming.length, icon: Clock, color: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Completed', value: completed, icon: CheckCircle, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Packages', value: packages.length, icon: Package, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Enrollments', value: enrollments.length, icon: Users, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10' },
        ].map(stat => (
          <div key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-background/30 backdrop-blur-md p-4 transition-all hover:bg-background/40 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground leading-none">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Sessions Tab ── */}
      {activeTab === 'sessions' && (
        <div className="rounded-3xl p-5 border border-black/10 dark:border-white/10 bg-background/30 backdrop-blur-md shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <p className="text-[15px] font-bold text-foreground">All Sessions</p>
            <div className="inline-flex items-center gap-1 p-1 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 overflow-x-auto w-full sm:w-auto">
              {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap ${statusFilter === s ? 'bg-background shadow-sm text-violet-500 dark:text-violet-400' : 'text-muted-foreground hover:text-foreground'}`}>
                  {s === 'ALL' ? 'All' : s === 'NO_SHOW' ? 'No Show' : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center"
                style={{ background: '#7c3aed15' }}>
                <Dumbbell className="h-5 w-5 text-violet-400/60" />
              </div>
              <p className="text-[13px] text-muted-foreground">No sessions found</p>
              <button onClick={() => setShowSchedule(true)}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                <Plus className="h-3 w-3" /> Schedule first session
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(session => (
                <SessionRow
                  key={session.id}
                  session={session}
                  onComplete={handleComplete}
                  onCancel={handleCancel}
                  isTrainer={isTrainer}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Enrollments Tab ── */}
      {activeTab === 'enrollments' && (
        <div className="space-y-4">
          {enrollments.length === 0 ? (
            <div className="rounded-3xl p-12 flex flex-col items-center gap-3 border border-black/10 dark:border-white/10 bg-background/30 backdrop-blur-md shadow-sm">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-[13px] text-muted-foreground">No enrollments yet</p>
              {isOwnerOrManager && (
                <button onClick={() => setShowEnroll(true)}
                  className="text-[13px] font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1 mt-2">
                  <Plus className="h-4 w-4" /> Enroll a member
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {enrollments.map((e) => {
                const progress = (e.usedSessions / e.totalSessions) * 100
                return (
                  <div key={e.id} className="rounded-3xl p-5 transition-all border border-black/10 dark:border-white/10 bg-background/30 backdrop-blur-md shadow-sm hover:bg-background/40">

                    {/* Member info */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[14px] font-semibold text-foreground">{e.member.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{e.member.phone}</p>
                      </div>
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg ${
                        e.status === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'
                      }`} style={{
                        background: e.status === 'ACTIVE' ? '#10b98115' : '#ef444415'
                      }}>
                        {e.status}
                      </span>
                    </div>

                    {/* Package name */}
                    <p className="text-xs text-muted-foreground mb-1">{e.package.name}</p>

                    {/* Progress bar */}
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Sessions used</span>
                      <span className="text-foreground font-medium">{e.usedSessions}/{e.totalSessions}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: '#ffffff08' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#7c3aed,#a855f7)' }} />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Remaining</p>
                        <p className="text-[18px] font-bold text-foreground">{e.remainingSessions}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-muted-foreground">Paid</p>
                        <p className="text-[18px] font-bold text-emerald-400">
                          ₹{Number(e.amountPaid).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Packages Tab ── */}
      {activeTab === 'packages' && (
        <div className="rounded-3xl p-5 border border-black/10 dark:border-white/10 bg-background/30 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[15px] font-bold text-foreground">PT Packages</p>
            {isOwnerOrManager && (
              <button onClick={() => setShowPackage(true)}
                className="flex items-center gap-1.5 text-[12px] font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Package
              </button>
            )}
          </div>

          {packages.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <Dumbbell className="h-8 w-8 text-muted-foreground" />
              <p className="text-[13px] text-muted-foreground">No packages yet</p>
              {isOwnerOrManager && (
                <button onClick={() => setShowPackage(true)}
                  className="text-[13px] font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1 mt-2">
                  <Plus className="h-4 w-4" /> Create first package
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map(pkg => (
                <div key={pkg.id} className="rounded-2xl p-5 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 transition-all hover:bg-black/10 dark:hover:bg-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-foreground">{pkg.name}</p>
                      {pkg.description && (
                        <p className="text-[12.5px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{pkg.description}</p>
                      )}
                    </div>
                    <span className="text-[14px] font-bold text-emerald-400 ml-3 flex-shrink-0">
                      ₹{pkg.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-violet-400 px-2 py-0.5 rounded-lg"
                      style={{ background: '#7c3aed15', border: '1px solid #7c3aed30' }}>
                      {pkg.sessions} sessions
                    </span>
                    {pkg.durationDays && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {pkg.durationDays}d validity
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}