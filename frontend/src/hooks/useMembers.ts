'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/src/lib/api'
import { toast } from 'sonner'
import type { Member, Plan } from '@/src/types'

export const useMembers = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [plan, setPlan] = useState('')

  // ─── Members ─────────────────────────────────
  const { data, isLoading: loading } = useQuery({
    queryKey: ['members', { page, search, status, plan }],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', '20')
      if (search) params.append('search', search)
      if (status) params.append('status', status)
      if (plan) params.append('planId', plan)

      const res = await api.get(`/api/members?${params.toString()}`)
      return res.data.data // { members, pagination: { total } }
    },
    staleTime: 1000 * 60 * 2,
  })

  // ─── Plans (reuses cache from usePlans) ──────
  const { data: plansData } = useQuery<Plan[]>({
    queryKey: ['plans', { includeInactive: false }],
    queryFn: async () => {
      const res = await api.get('/api/plans')
      return res.data.data
    },
    staleTime: 1000 * 60 * 2,
  })

  // ─── Delete ───────────────────────────────────
  const { mutateAsync: deleteMember } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/members/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Member deleted')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete member')
    }
  })

  return {
    members: (data?.members ?? []) as Member[],
    total: data?.pagination?.total ?? 0,  // ✅ matches your API shape
    loading,
    page,
    setPage,
    search,
    setSearch,
    status,
    setStatus,
    plan,
    setPlan,
    plans: plansData ?? [],
    deleteMember,
  }
}