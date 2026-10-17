// Сырой ответ /deals
export interface RawDeal {
  internalName: string
  title: string
  metacriticLink: string | null
  dealID: string
  storeID: string
  gameID: string
  salePrice: string
  normalPrice: string
  isOnSale: string // "0" | "1"
  savings: string
  metacriticScore: string
  steamRatingText: string | null
  steamRatingPercent: string
  steamRatingCount: string
  steamAppID: string | null
  releaseDate: number // unix, секунды (0 если неизвестно)
  lastChange: number
  dealRating: string
  thumb: string
}

// Нормализованная модель для UI
export interface Deal {
  id: string
  gameId: string
  title: string
  storeId: string
  salePrice: number
  normalPrice: number
  savings: number // 0..100
  metacritic: number // 0 если нет
  steamRating: number // 0..100
  steamRatingText: string | null
  steamAppId: string | null
  releaseDate: Date | null
  dealRating: number
  thumb: string
  url: string // ссылка на магазин через redirect
}

export interface Store {
  storeID: string
  storeName: string
  isActive: number
  images: { banner: string; logo: string; icon: string }
}

export type SortBy =
  | 'Deal Rating'
  | 'Title'
  | 'Savings'
  | 'Price'
  | 'Metacritic'
  | 'Reviews'
  | 'Release'
  | 'Store'

export interface DealsParams {
  title?: string
  storeID?: string[] // можно несколько магазинов
  lowerPrice?: number
  upperPrice?: number
  metacritic?: number
  steamRating?: number
  AAA?: boolean
  onSale?: boolean
  sortBy?: SortBy
  desc?: boolean
  pageNumber?: number
  pageSize?: number
}

export interface DealsPage {
  deals: Deal[]
  totalPages: number | null // null, если заголовок недоступен
}

export interface GameInfo {
  info: { title: string; steamAppID: string | null; thumb: string }
  cheapestPriceEver: { price: string; date: number }
  deals: { storeID: string; dealID: string; price: string; retailPrice: string; savings: string }[]
}

