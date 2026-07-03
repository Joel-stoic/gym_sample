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
    <div className="flex h-64 items-center justify-center text-white">Loading...</div>
  )

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-white">
        Edit Plan
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Name */}
        <div>
          <label className="mb-2 block text-sm text-white">
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
            className="w-full rounded-xl border border-white/10 bg-[#111118] px-4 py-3 text-white outline-none"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="mb-2 block text-sm text-white">
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
            className="w-full rounded-xl border border-white/10 bg-[#111118] px-4 py-3 text-white outline-none"
          />
        </div>

        {/* Price */}
        <div>
          <label className="mb-2 block text-sm text-white">
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
            className="w-full rounded-xl border border-white/10 bg-[#111118] px-4 py-3 text-white outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm text-white">
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
            className="w-full rounded-xl border border-white/10 bg-[#111118] px-4 py-3 text-white outline-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-crayola px-5 py-3 text-white transition hover:bg-crayola"
        >
          {saving ? 'Updating...' : 'Update Plan'}
        </button>
      </form>
    </div>
  )
}