import { useQuery } from '@tanstack/react-query'
import { getDeals } from '../api/cheapshark'

export function useAnalyticsDeals(pages: number) {
  return useQuery({
    queryKey: ['analytics-deals', pages],
    queryFn: async ({ signal }) => {
      const results = await Promise.all(
        Array.from({ length: pages }, (_, i) =>
          getDeals(
            { onSale: true, sortBy: 'Deal Rating', desc: true, pageSize: 60, pageNumber: i },
            signal,
          ),
        ),
      )
      const all = results.flatMap((r) => r.deals)
      return [...new Map(all.map((d) => [d.id, d])).values()] // убираем дубликаты
    },
    staleTime: 10 * 60 * 1000,
  })
}