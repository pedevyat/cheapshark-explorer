import { useQuery } from '@tanstack/react-query'
import { getStores } from '../api/cheapshark'

export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: ({ signal }) => getStores(signal),
    staleTime: Infinity, // список магазинов практически не меняется
  })
}