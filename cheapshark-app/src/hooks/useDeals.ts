import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getDeals } from '../api/cheapshark'
import type { DealsParams } from '../api/types'

export function useDeals(params: DealsParams) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['deals', params],
    queryFn: ({ signal }) => getDeals(params, signal),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  })

  const page = params.pageNumber ?? 0
  const total = query.data?.totalPages

  useEffect(() => {
    if (total != null && page + 1 >= total) return // следующей страницы нет
    if (!query.data) return
    const next = { ...params, pageNumber: page + 1 }
    queryClient.prefetchQuery({
      queryKey: ['deals', next],
      queryFn: ({ signal }) => getDeals(next, signal),
      staleTime: 5 * 60 * 1000,
    })
  }, [query.data, page, total, params, queryClient])

  return query
}