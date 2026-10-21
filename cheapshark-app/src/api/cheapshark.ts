import type { Deal, DealsPage, DealsParams, GameInfo, RawDeal, Store } from './types'

const ORIGIN = 'https://www.cheapshark.com'
const BASE = `${ORIGIN}/api/1.0`

export const redirectUrl = (dealID: string) =>
  `${ORIGIN}/redirect?dealID=${encodeURIComponent(dealID)}`

export const storeImageUrl = (path: string) => `${ORIGIN}${path}`

async function request(path: string, params?: URLSearchParams, signal?: AbortSignal) {
  const qs = params?.toString()
  const res = await fetch(`${BASE}${path}${qs ? `?${qs}` : ''}`, { signal })
  if (!res.ok) throw new Error(`CheapShark API: ${res.status} ${res.statusText}`)
  return res
}

function normalize(d: RawDeal): Deal {
  return {
    id: d.dealID,
    gameId: d.gameID,
    title: d.title,
    storeId: d.storeID,
    salePrice: Number(d.salePrice),
    normalPrice: Number(d.normalPrice),
    savings: Math.round(Number(d.savings)),
    metacritic: Number(d.metacriticScore) || 0,
    steamRating: Number(d.steamRatingPercent) || 0,
    steamRatingText: d.steamRatingText,
    steamAppId: d.steamAppID,
    releaseDate: d.releaseDate ? new Date(d.releaseDate * 1000) : null,
    dealRating: Number(d.dealRating),
    thumb: d.thumb,
    url: redirectUrl(d.dealID),
  }
}

export async function getDeals(p: DealsParams = {}, signal?: AbortSignal): Promise<DealsPage> {
  const q = new URLSearchParams()
  if (p.title) q.set('title', p.title)
  if (p.storeID?.length) q.set('storeID', p.storeID.join(','))
  if (p.lowerPrice !== undefined) q.set('lowerPrice', String(p.lowerPrice))
  if (p.upperPrice !== undefined) q.set('upperPrice', String(p.upperPrice))
  if (p.metacritic) q.set('metacritic', String(p.metacritic))
  if (p.steamRating) q.set('steamRating', String(p.steamRating))
  if (p.AAA) q.set('AAA', '1')
  if (p.onSale) q.set('onSale', '1')
  if (p.sortBy) q.set('sortBy', p.sortBy)
  if (p.desc !== undefined) q.set('desc', p.desc ? '1' : '0')
  q.set('pageNumber', String(p.pageNumber ?? 0)) // страницы нумеруются с 0
  q.set('pageSize', String(Math.min(p.pageSize ?? 24, 60))) // максимум 60

  const res = await request('/deals', q, signal)
  const raw: RawDeal[] = await res.json()
  const total = res.headers.get('X-Total-Page-Count')

  return {
    deals: raw.map(normalize),
    totalPages: total ? Number(total) : null,
  }
}

export async function getStores(signal?: AbortSignal): Promise<Store[]> {
  const res = await request('/stores', undefined, signal)
  const all: Store[] = await res.json()
  return all.filter((s) => s.isActive === 1)
}

export async function getGame(gameID: string, signal?: AbortSignal): Promise<GameInfo> {
  const res = await request('/games', new URLSearchParams({ id: gameID }), signal)
  return res.json()
}