'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePlans } from '@/src/hooks/usePlans'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CreditCard,
  Plus,
  MoreHorizontal,
  Users,
  Clock,
  IndianRupee,
  Pencil,
  XCircle,
} from 'lucide-react'
import type { Plan } from '@/src/types'
import { useAuthStore } from '@/src/store/authStore'

function PlansSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-24 animate-pulse rounded-md bg-muted mb-2" />
          <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-10 w-28 animate-pulse rounded-md bg-muted" />
      </div>
      <div>
        <div className="h-3 w-24 animate-pulse rounded-md bg-muted mb-3" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4 rounded-md p-5 border border-border bg-card">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-muted flex-shrink-0" />
                <div className="space-y-2 w-full">
                  <div className="h-5 w-1/2 animate-pulse rounded-md bg-muted" />
                  <div className="h-3 w-3/4 animate-pulse rounded-md bg-muted" />
                </div>
              </div>
              <div className="border-t border-border" />
              <div className="h-8 w-1/3 animate-pulse rounded-md bg-muted" />
              <div className="flex items-center gap-3">
                <div className="h-6 w-16 animate-pulse rounded-md bg-muted" />
                <div className="h-6 w-20 animate-pulse rounded-md bg-muted" />
                <div className="ml-auto h-6 w-16 animate-pulse rounded-md bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  inactive,
  onDeactivate,
  onEdit,
}: {
  plan: Plan
  inactive?: boolean
  onDeactivate?: () => void
  onEdit?: () => void
}) {
  return (
    <div
      className="relative flex flex-col gap-4 rounded-md p-5 transition-all duration-200"
      style={{
        background: inactive ? 'var(--accent)' : 'var(--card)',
        border: inactive ? '1px solid #ffffff06' : '1px solid #ffffff0a',
        opacity: inactive ? 0.55 : 1,
      }}
      onMouseEnter={(e) => {
        if (!inactive)
          (e.currentTarget as HTMLDivElement).style.border =
            '1px solid #7c3aed30'
      }}
      onMouseLeave={(e) => {
        if (!inactive)
          (e.currentTarget as HTMLDivElement).style.border =
            '1px solid #ffffff0a'
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${inactive ? 'bg-muted text-muted-foreground' : 'bg-violet-500/10 text-violet-500'}`}
          >
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <h3
              className="text-[15px] font-bold text-foreground leading-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {plan.name}
            </h3>
            {plan.description && (
              <p className="mt-0.5 text-[12px] text-muted-foreground line-clamp-1">
                {plan.description}
              </p>
            )}
          </div>
        </div>

        {!inactive && (onEdit || onDeactivate) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '4px',
                boxShadow: '0 16px 40px #00000060',
              }}
            >
              {onEdit && (
                <DropdownMenuItem
                  className="rounded-lg text-[13px] text-muted-foreground focus:bg-muted focus:text-foreground cursor-pointer"
                  onClick={onEdit}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Plan
                </DropdownMenuItem>
              )}
              {onDeactivate && (
                <DropdownMenuItem
                  className="rounded-lg text-[13px] focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                  style={{ color: '#ef4444' }}
                  onClick={onDeactivate}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #ffffff06' }} />

      {/* Price */}
      <div className="flex items-baseline gap-1">
        <span className="text-[13px] text-muted-foreground">₹</span>
        <span
          className="text-[28px] font-bold text-foreground leading-none"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}
        >
          {(plan.price / 100).toLocaleString('en-IN')}
        </span>
        <span className="text-[12px] text-muted-foreground">/ plan</span>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] bg-muted/50 text-muted-foreground"
        >
          <Clock className="h-3.5 w-3.5 text-red-300" />
          {plan.durationDays} days
        </div>

        {plan._count && (
          <div
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] bg-muted/50 text-muted-foreground"
          >
            <Users className="h-3.5 w-3.5 text-green-400" />
            {plan._count.members} members
          </div>
        )}

        <span
          className={`ml-auto rounded-md px-2.5 py-1 text-[11px] font-medium border ${inactive ? 'bg-muted/50 text-muted-foreground border-border' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}
        >
          {inactive ? 'Inactive' : 'Active'}
        </span>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PlansPage() {
  const router = useRouter()
  const { staff } = useAuthStore()
  const canManage = staff?.role === 'OWNER' || staff?.role === 'MANAGER'  // ← add this
  const { plans, loading, deactivatePlan } = usePlans()
  const [deactivateId, setDeactivateId] = useState<string | null>(null)

  const activePlans = (plans as Plan[]).filter((p) => p.isActive)
  const inactivePlans = (plans as Plan[]).filter((p) => !p.isActive)

  if (loading) {
    return <PlansSkeleton />
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-[20px] font-bold tracking-tight text-foreground"
            style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}
          >
            Plans
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {activePlans.length} active plan{activePlans.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => router.push('/plans/new')}
            className="flex h-10 items-center justify-center gap-2 px-5 text-[13px] font-medium transition-all duration-150 bg-card hover:bg-accent text-card-foreground border border-border rounded-md shadow-sm hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Add Plan
          </button>
        )}
      </div>

      {/* ── Empty ───────────────────────────────────────────────────────────── */}
      {plans.length === 0 && (
        <div
          className="flex h-64 flex-col items-center justify-center gap-4 rounded-md"
          
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-md bg-violet-500/10 text-violet-500"
          >
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-medium text-foreground">No plans yet</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Create your first membership plan
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => router.push('/plans/new')}
              className="flex h-10 items-center justify-center gap-2 px-5 text-[13px] font-medium transition-all duration-150 bg-card hover:bg-accent text-card-foreground border border-border rounded-md shadow-sm hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              Add Plan
            </button>
          )}
        </div>
      )}

      {/* ── Active Plans ─────────────────────────────────────────────────────── */}
      {activePlans.length > 0 && (
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Active Plans
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activePlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onDeactivate={canManage ? () => setDeactivateId(plan.id) : undefined}
                onEdit={canManage ? () => router.push(`/plans/${plan.id}/edit`) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Inactive Plans ───────────────────────────────────────────────────── */}
      {inactivePlans.length > 0 && (
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Inactive Plans
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inactivePlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} inactive />
            ))}
          </div>
        </div>
      )}

      {/* ── Deactivate Dialog ────────────────────────────────────────────────── */}
      <AlertDialog
        open={!!deactivateId}
        onOpenChange={() => setDeactivateId(null)}
      >
        <AlertDialogContent
          style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Deactivate Plan?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This plan will no longer be available for new members. Existing
              members on this plan will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-border bg-muted text-foreground hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl border-0 bg-red-600 text-foreground hover:bg-red-500"
              style={{ boxShadow: '0 4px 16px #ef444430' }}
              onClick={async () => {
                if (deactivateId) {
                  await deactivatePlan(deactivateId)
                  setDeactivateId(null)
                }
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}