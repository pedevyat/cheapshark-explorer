interface Props {
  page: number // с 0
  totalPages: number | null
  hasMore: boolean // для режима без totalPages
  disabled?: boolean
  onChange: (page: number) => void
}

// Список номеров: 1 … 4 5 [6] 7 8 … 20
function getPages(current: number, total: number): (number | '…')[] {
  const pages = new Set([0, total - 1, current - 1, current, current + 1])
  const sorted = [...pages].filter((p) => p >= 0 && p < total).sort((a, b) => a - b)
  const result: (number | '…')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('…')
    result.push(p)
  })
  return result
}

const btn =
  'min-w-9 rounded-lg border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40'

export default function Pagination({ page, totalPages, hasMore, disabled, onChange }: Props) {
  const known = totalPages !== null
  const canPrev = page > 0
  const canNext = known ? page < totalPages - 1 : hasMore

  if (known && totalPages <= 1) return null

  return (
    <nav aria-label="Пагинация" className="flex flex-wrap items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={!canPrev || disabled}
        className={`${btn} border-gray-300 bg-white hover:bg-gray-100`}
      >
        ← Назад
      </button>

      {known ? (
        <>
          {/* на телефоне — компактный счётчик, на sm+ — номера страниц */}
          <span className="px-2 text-sm text-gray-600 sm:hidden">
            {page + 1} / {totalPages}
          </span>
          <div className="hidden items-center gap-1 sm:flex">
            {getPages(page, totalPages).map((p, i) =>
              p === '…' ? (
                <span key={`gap-${i}`} className="px-1 text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChange(p)}
                  disabled={disabled}
                  aria-current={p === page ? 'page' : undefined}
                  className={`${btn} ${
                    p === page
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white hover:bg-gray-100'
                  }`}
                >
                  {p + 1}
                </button>
              ),
            )}
          </div>
        </>
      ) : (
        <span className="px-2 text-sm text-gray-600">Страница {page + 1}</span>
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={!canNext || disabled}
        className={`${btn} border-gray-300 bg-white hover:bg-gray-100`}
      >
        Дальше →
      </button>
    </nav>
  )
}