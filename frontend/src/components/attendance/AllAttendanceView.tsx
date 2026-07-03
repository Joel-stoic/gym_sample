'use client'

import { useState, useRef } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Search, X, ChevronLeft, ChevronRight, Loader2, Calendar, UserCheck2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/src/lib/api'

// ─── Types ────────────────────────────────────────────────────────────

interface AttendanceRecord {
  id: string
  checkInAt: string
  markedBy: 'QR_SCAN' | 'STAFF_MANUAL'
  member: {
    name: string
    phone: string
    photoUrl?: string | null
    status: string
  }
}

interface AttendanceResponse {
  attendance: AttendanceRecord[]
  totalCount: number
  page: number
  limit: number
}

// ─── Helpers ──────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

// ─── Fetch fn ─────────────────────────────────────────────────────────

async function fetchAllAttendance(params: {
  page: number
  search: string
  startDate: string
  endDate: string
}): Promise<AttendanceResponse> {
  const q = new URLSearchParams()
  q.set('page', String(params.page))
  q.set('limit', '20')
  if (params.search)    q.set('search', params.search)
  if (params.startDate) q.set('startDate', params.startDate)
  if (params.endDate)   q.set('endDate', params.endDate)
  const res = await api.get(`/api/attendance?${q}`)
  return res.data.data
}

// ─── Skeleton Row ─────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.04] bg-white/[0.02] px-4 py-3">
      <div className="h-9 w-9 flex-shrink-0 animate-pulse rounded-lg bg-white/[0.06]" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-2.5 w-20 animate-pulse rounded bg-white/[0.04]" />
      </div>
      <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
      <div className="h-5 w-16 animate-pulse rounded-full bg-white/[0.06]" />
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
        <UserCheck2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {filtered ? 'No results match your filters' : 'No attendance records yet'}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {filtered ? 'Try adjusting the date range or search term' : 'Records will appear once members check in'}
      </p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────

export default function AllAttendanceView() {
  const [search, setSearch]       = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate]     = useState('')
  const [page, setPage]           = useState(1)

  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const LIMIT = 20

  const isFiltered = !!(debouncedSearch || startDate || endDate)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['attendance-all', page, debouncedSearch, startDate, endDate],
    queryFn: () => fetchAllAttendance({ page, search: debouncedSearch, startDate, endDate }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

  const records    = data?.attendance ?? []
  const total      = data?.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  // Debounced search
  const handleSearchChange = (val: string) => {
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val)
      setPage(1)
    }, 350)
  }

  const handleDateChange = (field: 'start' | 'end', val: string) => {
    if (field === 'start') setStartDate(val)
    else setEndDate(val)
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5">

      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">All Attendance</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {total > 0 ? `${total.toLocaleString()} total check-ins` : 'Full attendance history'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isFetching && !isLoading && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Search */}
        <div className="flex flex-col gap-1 sm:col-span-1">
          <label className="pl-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Search</label>
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Name or phone..."
              className="w-full rounded-xl border border-border bg-white/[0.03] py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
            />
            {search && (
              <button onClick={() => handleSearchChange('')} className="absolute right-3 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* From */}
        <div className="flex flex-col gap-1">
          <label className="pl-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">From</label>
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="w-full rounded-xl border border-border bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-foreground focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 [color-scheme:dark]"
            />
          </div>
        </div>

        {/* To */}
        <div className="flex flex-col gap-1">
          <label className="pl-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">To</label>
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className="w-full rounded-xl border border-border bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-foreground focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-1.5">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:grid-cols-[2fr_1fr_1fr_auto]">
          <span>Member</span>
          <span className="hidden sm:block">Date</span>
          <span>Time</span>
          <span>Via</span>
        </div>

        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : records.length === 0 ? (
          <EmptyState filtered={isFiltered} />
        ) : (
          <>
            {records.map((rec) => (
              <div
                key={rec.id}
                className="group grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-2xl border border-transparent px-4 py-3 transition-colors hover:border-border hover:bg-white/[0.02] sm:grid-cols-[2fr_1fr_1fr_auto]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-violet-600/20 text-[11px] font-semibold text-violet-300">
                    {initials(rec.member.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{rec.member.name}</p>
                    <p className="text-[11px] text-muted-foreground">{rec.member.phone}</p>
                  </div>
                </div>

                <span className="hidden text-sm text-[#9999aa] sm:block">
                  {formatDate(rec.checkInAt)}
                </span>

                <span className="text-sm tabular-nums text-[#9999aa]">
                  {formatTime(rec.checkInAt)}
                </span>

                <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                  rec.markedBy === 'QR_SCAN'
                    ? 'bg-violet-500/10 text-violet-400'
                    : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {rec.markedBy === 'QR_SCAN' ? 'QR' : 'Staff'}
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
            <span className="ml-2 text-[#444455]">({total} total)</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="h-8 border-border bg-card px-3 text-foreground hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isFetching}
              className="h-8 border-border bg-card px-3 text-foreground hover:bg-muted disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}