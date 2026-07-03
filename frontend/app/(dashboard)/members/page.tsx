'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMembers } from '@/src/hooks/useMembers'

import MemberTable from '@/src/components/members/MemberTable'
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { Users, Plus, Search, ChevronLeft, ChevronRight, ChevronDown, Trash2 } from 'lucide-react'
import NewMemberModal from '@/src/components/members/NewMemberModal'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Member {
  id: string
  name: string
  phone?: string
  planName?: string
  status: string
  expiresAt?: string | null
}

export interface GymPlan {
  id: string
  name: string
}

// ─── Shared dark style tokens ─────────────────────────────────────────────────
const surfaceClass = "bg-zinc-900/40 backdrop-blur-xl border border-white/5 shadow-xl"
const inputCls = `
  w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all
  placeholder:text-zinc-500 bg-black/40 border border-white/10
  focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 backdrop-blur-sm
`

// Status → color mapping
const STATUS_STYLES: Record<string, { bg: string; border: string; text: string; label: string; dot: string }> = {
  ACTIVE:         { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400',  label: 'Active',    dot: 'bg-emerald-500' },
  EXPIRED:        { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400',  label: 'Expired',   dot: 'bg-rose-500' },
  SUSPENDED:      { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400',  label: 'Suspended', dot: 'bg-amber-500' },
  PLAN_NOT_ADDED: { bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', text: 'text-zinc-400',  label: 'No plan',   dot: 'bg-zinc-500' },
}

// ─── Skeleton pulse ───────────────────────────────────────────────────────────
function SkeletonCell({ width = '100%', height = 14 }: { width?: string | number; height?: number }) {
  return (
    <div
      className="rounded-md bg-white/5 animate-pulse"
      style={{ width, height }}
    />
  )
}

function MemberTableSkeleton() {
  return (
    <div className={`hidden overflow-hidden rounded-2xl md:block ${surfaceClass}`}>
      <div
        className="grid px-5 py-4 border-b border-white/5 bg-black/40 backdrop-blur-md"
        style={{ gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 80px' }}
      >
        {['Member', 'Phone', 'Plan', 'Status', 'Expires', ''].map((h) => (
          <div key={h} className="flex items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              {h}
            </span>
          </div>
        ))}
      </div>

      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="grid items-center px-5 py-5 border-b border-white/5"
          style={{ gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 80px', opacity: 1 - i * 0.08 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse flex-shrink-0" style={{ animationDelay: `${i * 0.07}s` }} />
            <div className="flex flex-col gap-2">
              <SkeletonCell width={110} height={14} />
              <SkeletonCell width={70} height={12} />
            </div>
          </div>
          <SkeletonCell width={90} height={14} />
          <SkeletonCell width={72} height={24} />
          <SkeletonCell width={62} height={24} />
          <SkeletonCell width={80} height={14} />
          <div className="flex justify-end">
            <SkeletonCell width={32} height={32} />
          </div>
        </div>
      ))}
    </div>
  )
}

function MemberCardSkeleton() {
  return (
    <div className={`flex flex-col md:hidden ${surfaceClass} !rounded-none sm:!rounded-2xl border-x-0 sm:border-x`}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0"
          style={{ opacity: 1 - i * 0.09 }}
        >
          <div className="w-12 h-12 rounded-full bg-white/5 animate-pulse flex-shrink-0" style={{ animationDelay: `${i * 0.06}s` }} />
          <div className="flex flex-1 flex-col gap-2">
            <SkeletonCell width="46%" height={14} />
            <SkeletonCell width="30%" height={12} />
          </div>
          <div className="flex flex-shrink-0 flex-col items-center gap-2">
            <SkeletonCell width={40} height={12} />
            <SkeletonCell width={12} height={12} />
          </div>
        </div>
      ))}
    </div>
  )
}

function MemberCard({
  member,
  onDelete,
  onOpen,
}: {
  member: Member
  onDelete: (id: string) => void
  onOpen: (id: string) => void
}) {
  const st = STATUS_STYLES[member.status] ?? STATUS_STYLES.PLAN_NOT_ADDED
  const initials = member.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || '?'

  const subtitle = [member.planName, member.phone].filter(Boolean).join('  ·  ')

  return (
    <div
      className="relative flex items-center gap-4 px-5 py-4 transition-all hover:bg-white/5 active:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 group"
      onClick={() => onOpen(member.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(member.id) }}
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 group-hover:scale-105 transition-transform">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">{member.name}</p>
        <p className="mt-1 truncate text-xs font-medium text-zinc-500">
          {subtitle || 'No plan yet'}
        </p>
      </div>

      <div className="flex flex-shrink-0 flex-col items-center gap-1.5 pr-8">
        <span className="text-xs font-semibold text-zinc-500">
          {member.expiresAt
            ? new Date(member.expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
            : '—'}
        </span>
        <span className={`flex items-center gap-1.5 rounded-lg px-2 py-1 border ${st.bg} ${st.border}`}>
          <span className={`rounded-full w-1.5 h-1.5 ${st.dot} shadow-[0_0_8px] shadow-current`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${st.text}`}>
            {st.label}
          </span>
        </span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(member.id)
        }}
        aria-label={`Delete ${member.name}`}
        className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 transition-all active:scale-95"
      >
        <Trash2 className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  )
}

function PaginationSkeleton() {
  return (
    <div className="sticky bottom-0 z-10 -mb-5 flex items-center justify-between gap-3 rounded-t-2xl px-5 py-4 border-t border-white/10 bg-black/60 backdrop-blur-xl">
      <SkeletonCell width={90} height={36} />
      <SkeletonCell width={70} height={14} />
      <SkeletonCell width={90} height={36} />
    </div>
  )
}

function DarkSelect({
  value, onChange, options, placeholder, width = 160,
}: {
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
  placeholder: string
  width?: number
}) {
  return (
    <div className="relative w-full sm:w-auto group" style={{ maxWidth: width }}>
      <select
        value={value || 'ALL'}
        onChange={(e) => onChange(e.target.value === 'ALL' ? '' : e.target.value)}
        className="w-full appearance-none rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all cursor-pointer bg-black/40 border border-white/10 group-hover:border-white/20 backdrop-blur-sm shadow-sm"
        style={{ color: value ? 'white' : '#71717a' }}
      >
        <option value="ALL" className="bg-zinc-900">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-zinc-900 text-white">{o.label}</option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 group-hover:text-zinc-300 transition-colors"
      />
    </div>
  )
}

export default function MembersPage() {
  const router = useRouter()

  const {
    members, total, loading,
    page, setPage,
    search, setSearch,
    status, setStatus,
    plan, setPlan,
    plans, deleteMember,
  } = useMembers()

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [stableTotal, setStableTotal] = useState(0)
  
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (!loading) setStableTotal(total)
  }, [loading, total])

  const displayTotal = loading ? stableTotal : total
  const deletingMember = members.find((m: Member) => m.id === deleteId)

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMember(deleteId)
      setDeleteId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(displayTotal / 20))

  return (
    <div className="space-y-6 font-sans pb-10">
      
      {/* Ambient background glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[10%] w-[30%] h-[40%] rounded-full bg-purple-600/10 blur-[150px]" />
      </div>

      <div className="relative z-10">
        {/* Filters */}
        <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:px-0 mb-6">
          <div className="relative min-w-0 flex-1 group">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              className={`${inputCls} pl-11`}
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <div className="flex gap-3">
            <DarkSelect
              value={status}
              onChange={(v) => { setStatus(v); setPage(1) }}
              placeholder="All Status"
              width={160}
              options={[
                { label: 'Active',         value: 'ACTIVE' },
                { label: 'Expired',        value: 'EXPIRED' },
                { label: 'Suspended',      value: 'SUSPENDED' },
                { label: 'Plan Not Added', value: 'PLAN_NOT_ADDED' },
              ]}
            />
            <DarkSelect
              value={plan}
              onChange={(v) => { setPlan(v); setPage(1) }}
              placeholder="All Plans"
              width={180}
              options={plans.map((p: GymPlan) => ({ label: p.name, value: p.id }))}
            />
          </div>
        </div>

        {/* Header row */}
        <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-0 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-lg shadow-indigo-500/10 sm:hidden">
              <Users className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {displayTotal}
                </span>
                <span className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
                  Members
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all sm:w-auto bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_30px_rgba(99,102,241,0.5)] active:scale-95 border border-white/10"
          >
            <Plus className="h-4 w-4" />
            Add New Member
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="relative z-10">
            <div className="px-4 sm:px-0">
              <MemberTableSkeleton />
            </div>
            <MemberCardSkeleton />
            {displayTotal > 20 && <PaginationSkeleton />}
          </div>
        ) : members.length === 0 ? (
          <div className={`mx-4 sm:mx-0 flex flex-col items-center justify-center py-24 px-6 text-center rounded-3xl ${surfaceClass}`}>
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-500/10 border border-indigo-500/20 mb-6 shadow-xl shadow-indigo-500/10 ring-1 ring-white/5 ring-inset">
              <Users className="h-7 w-7 text-indigo-400" />
            </div>
            <p className="text-lg font-semibold text-white mb-2">No members found</p>
            <p className="text-sm text-zinc-500 max-w-sm mb-8 leading-relaxed">It looks like you don't have any members yet. Add your first member to start managing your gym.</p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10 backdrop-blur-md"
            >
              <Plus className="h-4 w-4" />
              Add Member
            </button>
          </div>
        ) : (
          <div className="relative z-10">
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-3xl px-4 sm:px-0 md:block">
              <div className={`overflow-hidden rounded-3xl ${surfaceClass}`}>
                <MemberTable members={members} onDelete={(id: string) => setDeleteId(id)} />
              </div>
            </div>

            {/* Mobile list */}
            <div className={`flex flex-col overflow-hidden md:hidden sm:rounded-3xl ${surfaceClass} !rounded-none sm:!rounded-3xl border-x-0 sm:border-x`}>
              {members.map((m: Member) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  onDelete={(id) => setDeleteId(id)}
                  onOpen={(id) => router.push(`/members/${id}`)}
                />
              ))}
            </div>

            {displayTotal > 20 && <div className="h-20" />}

            {/* Pagination */}
            {displayTotal > 20 && (
              <div className="sticky bottom-0 z-20 -mb-10 rounded-t-3xl border-t border-white/10 px-4 py-4 sm:px-6 bg-black/60 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                {/* Mobile */}
                <div className="flex items-center justify-between gap-4 sm:hidden">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    aria-label="Previous page"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-30 bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </button>
                  <div className="flex flex-col items-center gap-1 px-2">
                    <span className="text-sm font-bold text-white">
                      {page} <span className="text-zinc-500 font-medium">/ {totalPages}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={page * 20 >= displayTotal}
                    onClick={() => setPage(page + 1)}
                    aria-label="Next page"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-30 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 active:scale-95"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Desktop */}
                <div className="hidden items-center justify-between gap-4 sm:flex">
                  <p className="text-sm font-medium text-zinc-500">
                    Showing <span className="font-bold text-white">{(page - 1) * 20 + 1}</span>
                    <span className="mx-1.5">–</span>
                    <span className="font-bold text-white">{Math.min(page * 20, displayTotal)}</span>
                    <span className="mx-1.5">of</span>
                    <span className="font-bold text-white">{displayTotal}</span>
                  </p>
                  <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl transition-all disabled:opacity-30 text-zinc-400 hover:text-white hover:bg-white/10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {(() => {
                      const delta = 1
                      const start = Math.max(1, Math.min(page - delta, totalPages - delta * 2))
                      const end = Math.min(totalPages, start + delta * 2)
                      return Array.from({ length: end - start + 1 }, (_, i) => {
                        const p = start + i
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPage(p)}
                            className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                              page === p
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                : 'text-zinc-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      })
                    })()}
                    <button
                      type="button"
                      disabled={page * 20 >= displayTotal}
                      onClick={() => setPage(page + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl transition-all disabled:opacity-30 text-zinc-400 hover:text-white hover:bg-white/10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogOverlay className="bg-black/80 backdrop-blur-sm" />
        <AlertDialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-[420px] p-0 overflow-hidden bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl shadow-black">
          <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 to-orange-500" />
          <div className="p-6 sm:p-8">
            <AlertDialogHeader className="mb-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-inner">
                <Trash2 className="h-6 w-6 text-rose-500" strokeWidth={2} />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-white tracking-tight">
                Delete {deletingMember?.name ?? 'member'}?
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-2 text-sm leading-relaxed text-zinc-400">
                This will hide the member from your list. Their payment history and attendance records will be permanently archived but preserved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-3">
              <AlertDialogCancel className="w-full sm:w-auto h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold text-zinc-300 transition-all mt-0 sm:mt-0">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="w-full sm:w-auto h-11 rounded-xl border-0 bg-gradient-to-br from-rose-600 to-red-500 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 text-sm font-semibold text-white transition-all hover:brightness-110"
              >
                Delete Member
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <NewMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}