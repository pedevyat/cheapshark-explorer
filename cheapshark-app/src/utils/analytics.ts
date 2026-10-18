import type { Deal, Store } from '../api/types'

const sum = (a: number[]) => a.reduce((s, x) => s + x, 0)
const avg = (a: number[]) => (a.length ? sum(a) / a.length : 0)
const median = (a: number[]) => {
  if (!a.length) return 0
  const s = [...a].sort((x, y) => x - y)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

export function getKpis(deals: Deal[]) {
  const best = deals.reduce<Deal | null>((b, d) => (!b || d.savings > b.savings ? d : b), null)
  return {
    count: deals.length,
    avgSavings: avg(deals.map((d) => d.savings)),
    medianPrice: median(deals.map((d) => d.salePrice)),
    totalSaved: sum(deals.map((d) => d.normalPrice - d.salePrice)),
    best,
  }
}

export function byStore(deals: Deal[], stores: Store[] = []) {
  const groups = new Map<string, Deal[]>()
  for (const d of deals) groups.set(d.storeId, [...(groups.get(d.storeId) ?? []), d])

  return [...groups].map(([id, list]) => ({
    name: stores.find((s) => s.storeID === id)?.storeName ?? `Магазин ${id}`,
    count: list.length,
    avgSavings: avg(list.map((d) => d.savings)),
    avgPrice: avg(list.map((d) => d.salePrice)),
  })).sort((a, b) => b.count - a.count)
}

export function discountBuckets(deals: Deal[]) {
  const buckets = [
    { label: '1–24%', min: 1, max: 24 },
    { label: '25–49%', min: 25, max: 49 },
    { label: '50–74%', min: 50, max: 74 },
    { label: '75–89%', min: 75, max: 89 },
    { label: '90–100%', min: 90, max: 100 },
  ]
  return buckets.map((b) => ({
    label: b.label,
    count: deals.filter((d) => d.savings >= b.min && d.savings <= b.max).length,
  }))
}

export function priceBuckets(deals: Deal[]) {
  const buckets = [
    { label: 'до $5', min: 0, max: 5 },
    { label: '$5–10', min: 5, max: 10 },
    { label: '$10–20', min: 10, max: 20 },
    { label: '$20–40', min: 20, max: 40 },
    { label: 'от $40', min: 40, max: Infinity },
  ]
  return buckets.map((b) => ({
    label: b.label,
    count: deals.filter((d) => d.salePrice >= b.min && d.salePrice < b.max).length,
  }))
}

// Средняя цена и скидка по году выхода (годы, где меньше 3 игр, отбрасываем как шум)
export function byReleaseYear(deals: Deal[]) {
  const groups = new Map<number, Deal[]>()
  for (const d of deals) {
    if (!d.releaseDate) continue
    const y = d.releaseDate.getFullYear()
    groups.set(y, [...(groups.get(y) ?? []), d])
  }
  return [...groups]
    .filter(([, list]) => list.length >= 3)
    .sort(([a], [b]) => a - b)
    .slice(-15)
    .map(([year, list]) => ({
      year,
      avgSavings: avg(list.map((d) => d.savings)),
      avgPrice: avg(list.map((d) => d.salePrice)),
    }))
}