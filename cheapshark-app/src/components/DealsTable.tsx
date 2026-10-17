import { useMemo } from 'react'
import { storeImageUrl } from '../api/cheapshark'
import type { Deal, SortBy, Store } from '../api/types'
import { formatDate, formatPrice } from '../utils/format'

// Направление по умолчанию при первом клике: числа и даты от большего к меньшему, текст от А до Я
export const DEFAULT_DESC: Record<SortBy, boolean> = {
  'Deal Rating': true,
  Title: false,
  Savings: true,
  Price: false,
  Metacritic: true,
  Reviews: true,
  Release: true,
  Store: false,
}

export const SORT_LABELS: Partial<Record<SortBy, string>> = {
  Price: 'Цена',
  Savings: 'Размер скидки',
  Metacritic: 'Metacritic',
  Reviews: 'Отзывы Steam',
  Release: 'Дата выхода',
  Title: 'Название',
  Store: 'Магазин',
}

interface Props {
  deals: Deal[]
  stores: Store[] | undefined
  sortBy?: SortBy
  desc?: boolean
  onSort: (key: SortBy) => void
}

interface HeaderProps {
  label: string
  column: SortBy
  sortBy?: SortBy
  desc?: boolean
  onSort: (key: SortBy) => void
  className?: string
}

function SortableTh({ label, column, sortBy, desc, onSort, className = '' }: HeaderProps) {
  const active = sortBy === column
  const ariaSort = active ? (desc ? 'descending' : 'ascending') : 'none'

  return (
    <th scope="col" aria-sort={ariaSort} className={`px-3 py-3 ${className}`}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`group inline-flex items-center gap-1 uppercase ${
          active ? 'text-blue-700' : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        {label}
        <span aria-hidden className={active ? '' : 'opacity-0 group-hover:opacity-60'}>
          {active ? (desc ? '▼' : '▲') : '↕'}
        </span>
      </button>
    </th>
  )
}

export default function DealsTable({ deals, stores, sortBy, desc, onSort }: Props) {
  const storeMap = useMemo(
    () => new Map((stores ?? []).map((s) => [s.storeID, s])),
    [stores],
  )
  const h = { sortBy, desc, onSort }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs">
          <tr>
            <SortableTh label="Игра" column="Title" {...h} />
            <SortableTh label="Цена" column="Price" {...h} />
            <SortableTh label="Платформа" column="Store" {...h} />
            <SortableTh label="Metacritic" column="Metacritic" className="hidden md:table-cell" {...h} />
            <SortableTh label="Отзывы Steam" column="Reviews" className="hidden md:table-cell" {...h} />
            <SortableTh label="Дата выхода" column="Release" className="hidden lg:table-cell" {...h} />
            <th scope="col" className="px-3 py-3 text-right uppercase text-gray-500">
              Магазин
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {deals.map((d) => {
            const store = storeMap.get(d.storeId)
            return (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={d.thumb}
                      alt=""
                      loading="lazy"
                      className="hidden h-10 w-20 shrink-0 rounded object-cover sm:block"
                    />
                    <span className="font-medium">{d.title}</span>
                  </div>
                </td>

                <td className="whitespace-nowrap px-3 py-2">
                  <div className="font-semibold">{formatPrice(d.salePrice)}</div>
                  {d.savings > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-400 line-through">{formatPrice(d.normalPrice)}</span>
                      <span className="rounded bg-green-100 px-1 font-medium text-green-700">
                        −{d.savings}%
                      </span>
                    </div>
                  )}
                </td>

                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {store && (
                      <img src={storeImageUrl(store.images.icon)} alt="" className="h-4 w-4" />
                    )}
                    <span className="whitespace-nowrap">{store?.storeName ?? `Магазин ${d.storeId}`}</span>
                  </div>
                </td>

                <td className="hidden px-3 py-2 md:table-cell">{d.metacritic || '—'}</td>
                <td className="hidden px-3 py-2 md:table-cell">
                  {d.steamRating ? `${d.steamRating}%` : '—'}
                </td>
                <td className="hidden whitespace-nowrap px-3 py-2 lg:table-cell">
                  {formatDate(d.releaseDate)}
                </td>

                <td className="px-3 py-2 text-right">
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block whitespace-nowrap rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    Открыть ↗
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}