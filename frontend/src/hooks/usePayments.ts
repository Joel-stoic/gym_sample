'use client'

import { useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import api from '@/src/lib/api'
import { Payment } from '@/src/types'

const PAGE_SIZE = 20

export const paymentsQueryKey = (
  page: number,
  filters?: { memberId?: string; startDate?: string; endDate?: string }
) => ['payments', page, filters?.memberId, filters?.startDate, filters?.endDate] as const

export const usePayments = (filters?: {
  memberId?:  string
  startDate?: string
  endDate?:   string
}) => {
  const [page, setPage] = useState(1)

  const queryKey = paymentsQueryKey(page, filters)

  const { data, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const params: Record<string, any> = { page, limit: PAGE_SIZE }
      if (filters?.memberId)  params.memberId  = filters.memberId
      if (filters?.startDate) params.startDate = filters.startDate
      if (filters?.endDate)   params.endDate   = filters.endDate

      const res = await api.get('/api/payments', { params })
      return res.data.data as { payments: Payment[]; totalCount: number }
    },
    staleTime: 0,                       // always stale — invalidation fires refetch instantly
    placeholderData: (prev) => prev,    // keep previous page visible while next page loads
  })

  const payments   = data?.payments   ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  // reset to page 1 and refetch — called after mutations
  const resetAndRefetch = useCallback(() => {
    setPage(1)
    refetch()
  }, [refetch])

  return {
    payments,
    loading: isFetching && payments.length === 0,  // full spinner only on first load
    isFetching,                                     // subtle fade during background refetches
    page,
    totalPages,
    totalCount,
    setPage,
    refetch: resetAndRefetch,
  }
}