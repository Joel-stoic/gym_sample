import { useQuery } from '@tanstack/react-query'
import api from '@/src/lib/api'

export const PLAN_KEY = (id: string) => ['plans', id] as const

export function usePlan(id: string) {
  return useQuery({
    queryKey: PLAN_KEY(id),
    queryFn: async () => {
      const res = await api.get(`/api/plans/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}