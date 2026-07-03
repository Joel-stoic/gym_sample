'use client'

import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageHeader from '@/src/components/shared/PageHeader'
import GymQRCode from '@/src/components/attendance/QRCode'
import AttendanceTable from '@/src/components/attendance/AttendanceTable'
import AllAttendanceView from '@/src/components/attendance/AllAttendanceView'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  CalendarCheck,
  UserCheck,
  RefreshCw,
  QrCode,
  Activity,
  Search,
  X,
  Loader2,
} from 'lucide-react'
import api from '@/src/lib/api'
import { Member } from '@/src/types'
import { toast } from 'sonner'

// ─── Query fns ────────────────────────────────────────────────────────

async function fetchTodayAttendance() {
  const res = await api.get('/api/attendance/today')
  return res.data.data as { attendance: any[]; count: number }
}

async function fetchGymQR() {
  const res = await api.get('/api/attendance/qr')
  return res.data.data.qrCode as string
}

// ─── Member Search Input ──────────────────────────────────────────────

function MemberSearch({ onSelect }: { onSelect: (member: Member) => void }) {
  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState<Member[]>([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen]           = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef    = useRef<HTMLInputElement>(null)
  const wrapRef     = useRef<HTMLDivElement>(null)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return }
    setSearching(true)
    try {
      const res = await api.get(`/api/members?search=${encodeURIComponent(q)}&status=ACTIVE&limit=8`)
      setResults(res.data.data.members ?? [])
      setOpen(true)
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const handleSelect = (member: Member) => {
    onSelect(member)
    setQuery(member.name)
    setOpen(false)
    setResults([])
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setOpen(false)
    inputRef.current?.focus()
  }

  // Close on outside click
  useState(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  })

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative flex items-center">
        {searching
          ? <Loader2 className="absolute left-3 h-4 w-4 animate-spin text-muted-foreground" />
          : <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        }
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          placeholder="Search by name or phone..."
          className="w-full rounded-xl border border-border bg-white/[0.03] py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
        />
        {query && (
          <button onClick={handleClear} className="absolute right-3 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">No members found</div>
          ) : (
            results.map((member) => (
              <button
                key={member.id}
                onClick={() => handleSelect(member)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-[11px] font-semibold text-violet-500">
                  {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
                  <p className="text-[11px] text-muted-foreground">{member.phone}</p>
                </div>
                <span className="flex-shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                  Active
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Stats Card ───────────────────────────────────────────────────────

function StatsCard({ title, value, icon: Icon, iconClassName }: any) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-foreground">{value}</h3>
        </div>
        <div className={`rounded-2xl p-3 ${iconClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

// ─── Tab Button ───────────────────────────────────────────────────────

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-violet-600 text-foreground' : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────

export default function AttendancePage() {
  const queryClient = useQueryClient()

  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [dialogOpen, setDialogOpen]         = useState(false)
  const [activeTab, setActiveTab]           = useState<'today' | 'all'>('today')

  // Today's attendance — refetch every 30s while on Today tab
  const { data: todayData, isLoading: todayLoading } = useQuery({
    queryKey: ['attendance-today'],
    queryFn: fetchTodayAttendance,
    refetchInterval: activeTab === 'today' ? 30_000 : false,
    staleTime: 15_000,
  })

  // QR — stable, 24h cache matches backend TTL
  const { data: gymQR, isLoading: qrLoading } = useQuery({
    queryKey: ['attendance-qr'],
    queryFn: fetchGymQR,
    staleTime: 24 * 60 * 60 * 1000,
  })

  const todayAttendance = todayData?.attendance ?? []
  const todayCount      = todayData?.count ?? 0
  const loading         = todayLoading

  // Mark attendance mutation
  const markMutation = useMutation({
    mutationFn: (memberId: string) =>
      api.post('/api/attendance', { memberId, markedBy: 'STAFF_MANUAL' }),
    onSuccess: (_, _memberId) => {
      // Invalidate both today and all-records cache
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] })
      queryClient.invalidateQueries({ queryKey: ['attendance-all'] })
    },
  })

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) setSelectedMember(null)
  }

  const handleMarkAttendance = async () => {
    if (!selectedMember) { toast.error('Please select a member'); return }
    try {
      await markMutation.mutateAsync(selectedMember.id)
      toast.success(`Attendance marked for ${selectedMember.name}`)
      handleDialogChange(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Track member check-ins and daily activity"
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['attendance-today'] })}
              className="border-border bg-card text-foreground hover:bg-muted"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>

            <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button className="bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Mark Attendance
                </Button>
              </DialogTrigger>

              <DialogContent className="border-border bg-card text-foreground">
                <DialogHeader>
                  <DialogTitle className="text-xl">Mark Attendance</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                  <MemberSearch onSelect={setSelectedMember} />

                  {selectedMember && (
                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-[11px] font-semibold text-violet-500">
                        {selectedMember.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{selectedMember.name}</p>
                        <p className="text-[11px] text-muted-foreground">{selectedMember.phone}</p>
                      </div>
                      <button onClick={() => setSelectedMember(null)} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <Button
                    className="h-11 w-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground"
                    onClick={handleMarkAttendance}
                    disabled={markMutation.isPending || !selectedMember}
                  >
                    {markMutation.isPending
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Marking...</>
                      : 'Mark Present'
                    }
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Stats — Today tab only */}
      {activeTab === 'today' && (
        loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-3xl border border-border bg-card" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <StatsCard title="Present Today" value={todayCount}             icon={CalendarCheck} iconClassName="bg-green-500/15 text-green-400"  />
            <StatsCard title="QR Check-ins"  value={todayAttendance.length} icon={QrCode}        iconClassName="bg-violet-500/15 text-violet-400" />
            <StatsCard title="Activity"      value="Live"                   icon={Activity}      iconClassName="bg-blue-500/15 text-blue-400"     />
          </div>
        )
      )}

      {/* Tab switcher */}
      <div className="flex w-fit gap-1 rounded-2xl border border-border bg-card p-1">
        <TabButton active={activeTab === 'today'} onClick={() => setActiveTab('today')}>Today</TabButton>
        <TabButton active={activeTab === 'all'}   onClick={() => setActiveTab('all')}>All Records</TabButton>
      </div>

      {/* Tab content */}
      {activeTab === 'today' ? (
        loading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-[320px] animate-pulse rounded-3xl border border-border bg-card" />
            <div className="h-[320px] animate-pulse rounded-3xl border border-border bg-card lg:col-span-2" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
            <div className="rounded-3xl border border-border bg-card p-5">
              <GymQRCode qrCode={gymQR ?? null} loading={qrLoading} />
            </div>

            <div className="rounded-3xl border border-border bg-card p-5">
              <AttendanceTable attendance={todayAttendance} count={todayCount} />
            </div>
          </div>
        )
      ) : (
        <AllAttendanceView />
      )}
    </div>
  )
}