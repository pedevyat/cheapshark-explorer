const priceFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const dateFmt = new Intl.DateTimeFormat('ru-RU', { year: 'numeric', month: 'short', day: 'numeric' })

export const formatPrice = (n: number) => (n === 0 ? 'Бесплатно' : priceFmt.format(n))
export const formatDate = (d: Date | null) => (d ? dateFmt.format(d) : '—')