import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Chart } from 'react-chartjs-2'
import type { ChartData } from 'chart.js'
import { getGame } from '../api/cheapshark'
import type { Deal, Store } from '../api/types'
import { formatDate } from '../utils/format'
import ChartCard from './ChartCard'

interface Props {
  deals: Deal[]
  stores: Store[] | undefined
}

export default function GamePriceChart({ deals, stores }: Props) {
  const games = useMemo(
    () => [...new Map(deals.map((d) => [d.gameId, d.title])).entries()],
    [deals],
  )
  const [gameId, setGameId] = useState(games[0]?.[0] ?? '')
  const activeId = games.some(([id]) => id === gameId) ? gameId : games[0]?.[0]

  const { data, isPending, error } = useQuery({
    queryKey: ['game', activeId],
    queryFn: ({ signal }) => getGame(activeId!, signal),
    enabled: !!activeId,
    staleTime: 10 * 60 * 1000,
  })

  const chart = useMemo(() => {
    if (!data) return null
    const rows = [...data.deals]
      .map((d) => ({
        name: stores?.find((s) => s.storeID === d.storeID)?.storeName ?? `Магазин ${d.storeID}`,
        price: Number(d.price),
        retail: Number(d.retailPrice),
      }))
      .sort((a, b) => a.price - b.price)
    const cheapest = Number(data.cheapestPriceEver.price)

    return {
      cheapest,
      cheapestDate: new Date(data.cheapestPriceEver.date * 1000),
      data: {
        labels: rows.map((r) => r.name),
        datasets: [
          { type: 'bar', label: 'Обычная цена', data: rows.map((r) => r.retail), backgroundColor: '#cbd5e1' },
          { type: 'bar', label: 'Цена сейчас', data: rows.map((r) => r.price), backgroundColor: '#2563eb' },
          {
            type: 'line',
            label: 'Минимум за всё время',
            data: rows.map(() => cheapest),
            borderColor: '#dc2626',
            borderDash: [6, 4],
            pointRadius: 0,
          },
        ],
      } as unknown as ChartData<'bar'>,
    }
  }, [data, stores])

  return (
    <ChartCard
      title="Цена игры: сейчас и исторический минимум"
      subtitle={
        chart
          ? `Минимум $${chart.cheapest.toFixed(2)} был ${formatDate(chart.cheapestDate)}`
          : 'Выберите игру из текущих скидок'
      }
      className="lg:col-span-2"
    >
      <div className="absolute -top-14 right-0 w-full sm:w-72">
        <select
          value={activeId}
          onChange={(e) => setGameId(e.target.value)}
          aria-label="Игра"
          className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm"
        >
          {games.map(([id, title]) => (
            <option key={id} value={id}>{title}</option>
          ))}
        </select>
      </div>

      {isPending && <p className="text-sm text-gray-500">Загрузка…</p>}
      {error && <p className="text-sm text-red-600">Ошибка: {error.message}</p>}
      {chart && (
        <Chart
          type="bar"
          data={chart.data}
          options={{
            scales: { y: { beginAtZero: true, ticks: { callback: (v) => `$${v}` } } },
            plugins: { legend: { position: 'bottom' } },
          }}
        />
      )}
    </ChartCard>
  )
}