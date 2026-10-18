import { useMemo, useState } from 'react'
import { Bar, Doughnut, Line, Scatter } from 'react-chartjs-2'
import '../utils/chartSetup'
import { COLORS } from '../utils/chartSetup'
import ChartCard from '../components/ChartCard'
import GamePriceChart from '../components/GamePriceChart'
import TableSkeleton from '../components/TableSkeleton'
import { useAnalyticsDeals } from '../hooks/useAnalyticsDeals'
import { useStores } from '../hooks/useStores'
import { byReleaseYear, byStore, discountBuckets, getKpis, priceBuckets } from '../utils/analytics'
import { formatPrice } from '../utils/format'

const SAMPLE_OPTIONS = [
  { pages: 1, label: '60 скидок' },
  { pages: 3, label: '180 скидок' },
  { pages: 5, label: '300 скидок' },
]

export default function AnalyticsPage() {
  const [pages, setPages] = useState(3)
  const stores = useStores()
  const { data: deals, isPending, error, refetch } = useAnalyticsDeals(pages)

  const stats = useMemo(() => {
    if (!deals) return null
    return {
      kpis: getKpis(deals),
      stores: byStore(deals, stores.data),
      discounts: discountBuckets(deals),
      prices: priceBuckets(deals),
      years: byReleaseYear(deals),
      scatter: deals.filter((d) => d.metacritic > 0),
    }
  }, [deals, stores.data])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Аналитика скидок</h1>
          <p className="text-sm text-gray-500">
            Срез по лучшим текущим предложениям (по Deal Rating) из CheapShark
          </p>
        </div>
        <label className="text-sm text-gray-600">
          Выборка:{' '}
          <select
            value={pages}
            onChange={(e) => setPages(Number(e.target.value))}
            className="ml-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5"
          >
            {SAMPLE_OPTIONS.map((o) => (
              <option key={o.pages} value={o.pages}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      {isPending && <TableSkeleton rows={6} />}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Не удалось загрузить данные: {error.message}{' '}
          <button onClick={() => refetch()} className="ml-2 font-medium underline">Повторить</button>
        </div>
      )}

      {deals && stats && (
        <>
          {/* KPI */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Предложений" value={String(stats.kpis.count)} />
            <Kpi label="Средняя скидка" value={`${stats.kpis.avgSavings.toFixed(0)}%`} />
            <Kpi label="Медианная цена" value={formatPrice(stats.kpis.medianPrice)} />
            <Kpi
              label="Лучшая скидка"
              value={stats.kpis.best ? `−${stats.kpis.best.savings}%` : '—'}
              hint={stats.kpis.best?.title}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Количество скидок по магазинам */}
            <ChartCard title="Скидки по магазинам" subtitle="Количество предложений и средняя скидка">
              <Bar
                data={{
                  labels: stats.stores.map((s) => s.name),
                  datasets: [
                    {
                      label: 'Предложений',
                      data: stats.stores.map((s) => s.count),
                      backgroundColor: COLORS[0],
                      yAxisID: 'y',
                    },
                    {
                      label: 'Средняя скидка, %',
                      data: stats.stores.map((s) => Math.round(s.avgSavings)),
                      backgroundColor: COLORS[2],
                      yAxisID: 'y1',
                    },
                  ],
                }}
                options={{
                  scales: {
                    y: { beginAtZero: true, position: 'left' },
                    y1: { beginAtZero: true, max: 100, position: 'right', grid: { drawOnChartArea: false } },
                  },
                  plugins: { legend: { position: 'bottom' } },
                }}
              />
            </ChartCard>

            {/* Гистограмма скидок */}
            <ChartCard title="Распределение размеров скидок" subtitle="Сколько игр в каждом диапазоне">
              <Bar
                data={{
                  labels: stats.discounts.map((b) => b.label),
                  datasets: [
                    {
                      label: 'Игр',
                      data: stats.discounts.map((b) => b.count),
                      backgroundColor: COLORS.slice(0, 5),
                    },
                  ],
                }}
                options={{
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                  plugins: { legend: { display: false } },
                }}
              />
            </ChartCard>

            {/* Ценовые диапазоны */}
            <ChartCard title="Цены со скидкой" subtitle="Доля игр по ценовым диапазонам">
              <Doughnut
                data={{
                  labels: stats.prices.map((b) => b.label),
                  datasets: [{ data: stats.prices.map((b) => b.count), backgroundColor: COLORS.slice(0, 5) }],
                }}
                options={{ plugins: { legend: { position: 'bottom' } } }}
              />
            </ChartCard>

            {/* Metacritic vs цена */}
            <ChartCard
              title="Рейтинг и цена"
              subtitle="Каждая точка — игра: оценка Metacritic против цены со скидкой"
            >
              <Scatter
                data={{
                  datasets: [
                    {
                      label: 'Игры',
                      data: stats.scatter.map((d) => ({ x: d.metacritic, y: d.salePrice })),
                      backgroundColor: 'rgba(37, 99, 235, 0.55)',
                      pointRadius: 4,
                    },
                  ],
                }}
                options={{
                  scales: {
                    x: { title: { display: true, text: 'Metacritic' }, min: 0, max: 100 },
                    y: { title: { display: true, text: 'Цена, $' }, beginAtZero: true },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => {
                          const d = stats.scatter[ctx.dataIndex]
                          return `${d.title}: ${formatPrice(d.salePrice)}, MC ${d.metacritic}`
                        },
                      },
                    },
                  },
                }}
              />
            </ChartCard>

            {/* Тренд по году выхода */}
            <ChartCard
              title="Тенденция по году выхода"
              subtitle="Средняя цена и скидка в зависимости от года релиза"
              className="lg:col-span-2"
            >
              <Line
                data={{
                  labels: stats.years.map((y) => String(y.year)),
                  datasets: [
                    {
                      label: 'Средняя цена, $',
                      data: stats.years.map((y) => Number(y.avgPrice.toFixed(2))),
                      borderColor: COLORS[0],
                      backgroundColor: COLORS[0],
                      tension: 0.3,
                      yAxisID: 'y',
                    },
                    {
                      label: 'Средняя скидка, %',
                      data: stats.years.map((y) => Math.round(y.avgSavings)),
                      borderColor: COLORS[1],
                      backgroundColor: COLORS[1],
                      tension: 0.3,
                      yAxisID: 'y1',
                    },
                  ],
                }}
                options={{
                  scales: {
                    y: { beginAtZero: true, position: 'left' },
                    y1: { beginAtZero: true, max: 100, position: 'right', grid: { drawOnChartArea: false } },
                  },
                  plugins: { legend: { position: 'bottom' } },
                }}
              />
            </ChartCard>

            {/* Одна игра */}

            <div className="pt-12 lg:col-span-2">
              <GamePriceChart deals={deals} stores={stores.data} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      {hint && <div className="truncate text-xs text-gray-500" title={hint}>{hint}</div>}
    </div>
  )
}