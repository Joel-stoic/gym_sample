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
      className="relative flex flex-col gap-4 rounded-2xl p-5 transition-all duration-200"
      style={{
        background: inactive ? '#0e0e16' : '#111118',
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
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
            style={{
              background: inactive ? '#ffffff08' : '#7c3aed20',
              color: inactive ? '#6b6b80' : '#a855f7',
            }}
          >
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <h3
              className="text-[15px] font-bold text-white leading-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {plan.name}
            </h3>
            {plan.description && (
              <p className="mt-0.5 text-[12px] text-[#6b6b80] line-clamp-1">
                {plan.description}
              </p>
            )}
          </div>
        </div>

        {!inactive && (onEdit || onDeactivate) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150"
                style={{
                  background: 'transparent',
                  border: '1px solid transparent',
                  color: '#6b6b80',
                }}
                onMouseEnter={(e) => {
                  ; (e.currentTarget as HTMLButtonElement).style.background =
                    '#ffffff08'
                    ; (e.currentTarget as HTMLButtonElement).style.border =
                      '1px solid #ffffff0f'
                    ; (e.currentTarget as HTMLButtonElement).style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  ; (e.currentTarget as HTMLButtonElement).style.background =
                    'transparent'
                    ; (e.currentTarget as HTMLButtonElement).style.border =
                      '1px solid transparent'
                    ; (e.currentTarget as HTMLButtonElement).style.color =
                      '#6b6b80'
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              style={{
                background: '#111118',
                border: '1px solid #ffffff0f',
                borderRadius: '12px',
                padding: '4px',
                boxShadow: '0 16px 40px #00000060',
              }}
            >
              {onEdit && (
                <DropdownMenuItem
                  className="rounded-lg text-[13px] text-[#9898b0] focus:bg-white/5 focus:text-white cursor-pointer"
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
        <span className="text-[13px] text-[#6b6b80]">₹</span>
        <span
          className="text-[28px] font-bold text-white leading-none"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}
        >
          {(plan.price / 100).toLocaleString('en-IN')}
        </span>
        <span className="text-[12px] text-[#6b6b80]">/ plan</span>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px]"
          style={{ background: '#ffffff08', color: '#9898b0' }}
        >
          <Clock className="h-3.5 w-3.5 text-red-300" />
          {plan.durationDays} days
        </div>

        {plan._count && (
          <div
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px]"
            style={{ background: '#ffffff08', color: '#9898b0' }}
          >
            <Users className="h-3.5 w-3.5 text-green-400" />
            {plan._count.members} members
          </div>
        )}

        <span
          className="ml-auto rounded-full px-2.5 py-1 text-[11px] font-medium"
          style={
            inactive
              ? {
                background: '#ffffff08',
                color: '#6b6b80',
                border: '1px solid #ffffff0f',
              }
              : {
                background: '#10b98115',
                color: '#10b981',
                border: '1px solid #10b98125',
              }
          }
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
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-crayola border-t-transparent" />
          <p className="text-[12px] text-[#6b6b80]">Loading plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-[20px] font-bold tracking-tight text-white"
            style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}
          >
            Plans
          </h1>
          <p className="mt-1 text-[13px] text-[#6b6b80]">
            {activePlans.length} active plan{activePlans.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => router.push('/plans/new')}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium text-white transition-all duration-150"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              boxShadow: '0 4px 20px #7c3aed30',
            }}
            onMouseEnter={(e) => {
              ; (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 4px 28px #7c3aed55'
                ; (e.currentTarget as HTMLButtonElement).style.transform =
                  'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              ; (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 4px 20px #7c3aed30'
                ; (e.currentTarget as HTMLButtonElement).style.transform =
                  'translateY(0)'
            }}
          >
            <Plus className="h-4 w-4" />
            Add Plan
          </button>
        )}
      </div>

      {/* ── Empty ───────────────────────────────────────────────────────────── */}
      {plans.length === 0 && (
        <div
          className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl"
          style={{ background: '#111118', border: '1px solid #ffffff0a' }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: '#7c3aed20' }}
          >
            <CreditCard className="h-5 w-5 text-crayola" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-medium text-white">No plans yet</p>
            <p className="mt-1 text-[12px] text-[#6b6b80]">
              Create your first membership plan
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => router.push('/plans/new')}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium text-white"
              style={{ background: '#7c3aed', boxShadow: '0 4px 16px #7c3aed30' }}
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
          <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-[#3d3d52]">
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
          <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-[#3d3d52]">
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
            background: '#111118',
            border: '1px solid #ffffff0f',
            borderRadius: '16px',
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Deactivate Plan?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#6b6b80]">
              This plan will no longer be available for new members. Existing
              members on this plan will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl border-0 bg-red-600 text-white hover:bg-red-500"
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