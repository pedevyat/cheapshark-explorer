import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Chart } from 'react-chartjs-2'
import type { ChartData, Plugin } from 'chart.js'
import { getGame } from '../api/cheapshark'
import type { Deal, Store } from '../api/types'
import { formatDate } from '../utils/format'

interface Props {
  deals: Deal[]
  stores: Store[] | undefined
}

// Горизонтальная линия на всю ширину графика (линейный датасет доходит только до центров столбцов)
const minLinePlugin = (value: number): Plugin => ({
  id: 'minLine',
  afterDatasetsDraw(chart) {
    const { ctx, chartArea, scales } = chart
    const y = scales.y.getPixelForValue(value)
    if (y < chartArea.top || y > chartArea.bottom) return
    ctx.save()
    ctx.strokeStyle = '#dc2626'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.beginPath()
    ctx.moveTo(chartArea.left, y)
    ctx.lineTo(chartArea.right, y)
    ctx.stroke()
    ctx.restore()
  },
})

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
    const maxValue = Math.max(cheapest, ...rows.map((r) => r.retail), 1)

    return {
      cheapest,
      cheapestDate: new Date(data.cheapestPriceEver.date * 1000),
      suggestedMax: Math.ceil(maxValue * 1.1),
      plugin: minLinePlugin(cheapest),
      data: {
        labels: rows.map((r) => r.name),
        datasets: [
          { type: 'bar', label: 'Обычная цена', data: rows.map((r) => r.retail), backgroundColor: '#cbd5e1' },
          { type: 'bar', label: 'Цена сейчас', data: rows.map((r) => r.price), backgroundColor: '#2563eb' },
          {
            // нужен только ради записи в легенде, саму линию рисует плагин
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
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-900">Цена игры: сейчас и исторический минимум</h2>
          <p className="text-xs text-gray-500">
            {chart
              ? `Минимум $${chart.cheapest.toFixed(2)} был ${formatDate(chart.cheapestDate)}`
              : 'Выберите игру из текущих скидок'}
          </p>
        </div>

        <select
          value={activeId}
          onChange={(e) => setGameId(e.target.value)}
          aria-label="Игра"
          className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 sm:w-72 sm:shrink-0"
        >
          {games.map(([id, title]) => (
            <option key={id} value={id}>{title}</option>
          ))}
        </select>
      </div>

      <div className="relative h-72 sm:h-80">
        {isPending && <p className="text-sm text-gray-500">Загрузка…</p>}
        {error && <p className="text-sm text-red-600">Ошибка: {error.message}</p>}
        {chart && (
          <Chart
            type="bar"
            data={chart.data}
            plugins={[chart.plugin]}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  suggestedMax: chart.suggestedMax,
                  ticks: { callback: (v) => `$${v}` },
                },
              },
              plugins: { legend: { position: 'bottom' } },
            }}
          />
        )}
      </div>
    </section>
  )
}