import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getDeals } from '../api/cheapshark'
import type { DealsParams } from '../api/types'

export function useDeals(params: DealsParams) {
  return useQuery({
    queryKey: ['deals', params],
    queryFn: ({ signal }) => getDeals(params, signal),
    placeholderData: keepPreviousData, // без «мигания» при смене страницы/фильтра
    staleTime: 5 * 60 * 1000,
  })
}