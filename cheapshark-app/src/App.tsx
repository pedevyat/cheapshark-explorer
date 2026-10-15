import { useState } from 'react'
import SearchForm from './components/SearchForm'
import { useDeals } from './hooks/useDeals'
import type { DealsParams } from './api/types'

export default function App() {
  const [params, setParams] = useState<DealsParams>({ sortBy: 'Deal Rating', pageSize: 12 })
  const { data, isPending, error } = useDeals(params)

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <SearchForm onChange={(p) => setParams((prev) => ({ ...prev, ...p, sortBy: prev.sortBy, pageSize: prev.pageSize }))} />

      {isPending && <p>Загрузка…</p>}
      {error && <p className="text-red-600">Ошибка: {error.message}</p>}
      {data?.deals.length === 0 && <p>Ничего не найдено</p>}
      <ul className="space-y-1">
        {data?.deals.map((d) => (
          <li key={d.id}>
            {d.title}: ${d.salePrice} (−{d.savings}%)
          </li>
        ))}
      </ul>
    </div>
  )
}