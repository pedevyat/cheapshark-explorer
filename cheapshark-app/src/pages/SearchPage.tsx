import { useState } from 'react'
import SearchForm from '../components/SearchForm'
import DealsTable, { DEFAULT_DESC, SORT_LABELS } from '../components/DealsTable'
import TableSkeleton from '../components/TableSkeleton'
import { useDeals } from '../hooks/useDeals'
import { useStores } from '../hooks/useStores'
import Pagination from '../components/Pagination'
import type { DealsParams, SortBy } from '../api/types'

export default function App() {
  const [params, setParams] = useState<DealsParams>({ sortBy: 'Deal Rating', pageSize: 20 })
  const stores = useStores()
  const { data, isPending, isFetching, error, refetch } = useDeals(params)

  const handleSort = (key: SortBy) =>
    setParams((prev) => ({
      ...prev,
      sortBy: key,
      // тот же столбец: меняем направление, новый: берём направление по умолчанию
      desc: prev.sortBy === key ? !prev.desc : DEFAULT_DESC[key],
      pageNumber: 0, // после смены сортировки возвращаемся на первую страницу
    }))

  const handlePage = (page: number) => {
    setParams((prev) => ({ ...prev, pageNumber: page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
    }

  const paginationProps = {
      page: params.pageNumber ?? 0,
      totalPages: data?.totalPages ?? null,
      hasMore: (data?.deals.length ?? 0) === (params.pageSize ?? 20),
      disabled: isFetching,
      onChange: handlePage,
    }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <h1 className="text-2xl flex justify-center font-bold">Поиск</h1>

      <div className="flex justify-center">
        <SearchForm 
          onChange={(p) =>
            setParams((prev) => ({
              sortBy: prev.sortBy,
              desc: prev.desc,
              pageSize: prev.pageSize,
              ...p,
            }))
          }
        />
      </div>

      {/* Сортировка для телефона: заголовки скрытых столбцов недоступны */}
      <div className="flex items-center gap-2 text-sm md:hidden">
        <label htmlFor="sort" className="text-gray-600">Сортировать:</label>
        <select
          id="sort"
          value={params.sortBy}
          onChange={(e) => handleSort(e.target.value as SortBy)}
          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5"
        >
          <option value="Deal Rating" disabled hidden>По умолчанию</option>
          {Object.entries(SORT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setParams((p) => ({ ...p, desc: !p.desc, pageNumber: 0 }))}
          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5"
          aria-label="Сменить направление сортировки"
        >
          {params.desc ? '▼ убыв.' : '▲ возр.'}
        </button>
      </div>

      {isPending && <TableSkeleton />}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Не удалось загрузить данные: {error.message}{' '}
          <button onClick={() => refetch()} className="ml-2 font-medium underline">
            Повторить
          </button>
        </div>
      )}

      {data && data.deals.length === 0 && (
        <p className="py-8 text-center text-gray-500">Ничего не найдено. Измените критерии поиска.</p>
      )}

      {data && data.deals.length > 0 && (
        <>
          <Pagination {...paginationProps} />

          <div className={isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <DealsTable
              deals={data.deals}
              stores={stores.data}
              sortBy={params.sortBy}
              desc={params.desc}
              onSort={handleSort}
            />
          </div>

          <Pagination {...paginationProps} />
        </>
      )}
    </div>
  )
}