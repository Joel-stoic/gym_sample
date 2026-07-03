'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/src/lib/api'
import { toast } from 'sonner'

export function usePlans(includeInactive = false) {
  const queryClient = useQueryClient()

  const { data: plans = [], isLoading: loading } = useQuery({
    queryKey: ['plans', { includeInactive }],
    queryFn: async () => {
      const res = await api.get('/api/plans', { params: { includeInactive } })
      return res.data.data
    },
    staleTime: 1000 * 60 * 2, // 2 min, matches your Redis TTL
  })

  const { mutateAsync: deactivatePlan } = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/plans/${id}/deactivate`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      toast.success('Plan deactivated')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to deactivate plan')
    }
  })

  return { plans, loading, deactivatePlan }
}