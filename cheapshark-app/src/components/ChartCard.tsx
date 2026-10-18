import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export default function ChartCard({ title, subtitle, children, className = '' }: Props) {
  return (
    <section className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
      <h2 className="font-semibold">{title}</h2>
      {subtitle && <p className="mb-3 text-xs text-gray-500">{subtitle}</p>}
      <div className="relative h-64 sm:h-72">{children}</div>
    </section>
  )
}