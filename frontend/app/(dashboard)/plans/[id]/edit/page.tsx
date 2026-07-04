'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/src/lib/api'
import { toast } from 'sonner'

export default function EditPlanPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '', durationDays: '', price: '', description: ''
  })

  // ─── Fetch (TanStack Query) ──────────────────
  const { data: plan, isLoading: loading } = useQuery({
    queryKey: ['plans', params.id],
    queryFn: async () => {
      const res = await api.get(`/api/plans/${params.id}`)
      return res.data.data
    },
    enabled: !!params.id,
  })

  // ─── Populate form when plan loads ──────────
  useEffect(() => {
    if (plan) {
      setForm({
        name: plan.name || '',
        durationDays: String(plan.durationDays || ''),
        price: String(plan.price / 100 || ''),
        description: plan.description || ''
      })
    }
  }, [plan])

  // ─── Update Plan ────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setSaving(true)
      await api.put(`/api/plans/${params.id}`, {
        name: form.name,
        durationDays: Number(form.durationDays),
        price: Math.round(Number(form.price) * 100),
        description: form.description
      })

      // ✅ bust cache so plans page shows fresh data
      queryClient.invalidateQueries({ queryKey: ['plans'] })

      toast.success('Plan updated successfully')
      router.push('/plans')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update plan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-foreground">Loading...</div>
  )

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        Edit Plan
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Name */}
        <div>
          <label className="mb-2 block text-sm text-foreground">
            Plan Name
          </label>

          <input
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value
              })
            }
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="mb-2 block text-sm text-foreground">
            Duration (days)
          </label>

          <input
            type="number"
            value={form.durationDays}
            onChange={(e) =>
              setForm({
                ...form,
                durationDays: e.target.value
              })
            }
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none"
          />
        </div>

        {/* Price */}
        <div>
          <label className="mb-2 block text-sm text-foreground">
            Price (₹)
          </label>

          <input
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm({
                ...form,
                price: e.target.value
              })
            }
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm text-foreground">
            Description
          </label>

          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value
              })
            }
            rows={4}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-3 text-foreground transition hover: bg-card hover:bg-accent text-card-foreground border border-border rounded-md shadow-sm"
        >
          {saving ? 'Updating...' : 'Update Plan'}
        </button>
      </form>
    </div>
  )
}