import type { DealsParams } from '../api/types'

export interface Tag {
  id: string
  label: string
  apply: (p: DealsParams) => DealsParams
}

export const TAGS: Tag[] = [
  { id: 'aaa', label: 'AAA-игры', apply: (p) => ({ ...p, AAA: true }) },
  { id: 'sale', label: 'Только со скидкой', apply: (p) => ({ ...p, onSale: true }) },
  {
    id: 'critics',
    label: 'Metacritic 75+',
    apply: (p) => ({ ...p, metacritic: Math.max(p.metacritic ?? 0, 75) }),
  },
  {
    id: 'reviews',
    label: 'Отзывы Steam 80%+',
    apply: (p) => ({ ...p, steamRating: Math.max(p.steamRating ?? 0, 80) }),
  },
  {
    id: 'under5',
    label: 'Дешевле $5',
    apply: (p) => ({ ...p, upperPrice: Math.min(p.upperPrice ?? Infinity, 5) }),
  },
  {
    id: 'under15',
    label: 'Дешевле $15',
    apply: (p) => ({ ...p, upperPrice: Math.min(p.upperPrice ?? Infinity, 15) }),
  },
]

export function applyTags(base: DealsParams, tagIds: string[]): DealsParams {
  return TAGS.filter((t) => tagIds.includes(t.id)).reduce((acc, t) => t.apply(acc), base)
}