import { useEffect, useRef, useState } from 'react'

export interface Option {
  value: string
  label: string
  icon?: string
}

interface Props {
  label: string
  options: Option[]
  selected: string[]
  onChange: (next: string[]) => void
  loading?: boolean
}

export default function MultiSelect({ label, options, selected, onChange, loading }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // закрытие по клику снаружи и по Escape
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])

  return (
    <div ref={ref} className="relative w-full sm:w-56">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm shadow-sm hover:border-gray-400"
      >
        <span className="truncate">
          {label}
          {selected.length > 0 && (
            <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
              {selected.length}
            </span>
          )}
        </span>
        <span aria-hidden className={`ml-2 transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 max-h-72 w-full min-w-56 overflow-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
          {loading && <p className="p-2 text-sm text-gray-500">Загрузка…</p>}
          {options.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm hover:bg-gray-100"
            >
              <input
                type="checkbox"
                checked={selected.includes(o.value)}
                onChange={() => toggle(o.value)}
                className="h-4 w-4"
              />
              {o.icon && <img src={o.icon} alt="" className="h-4 w-4" />}
              <span>{o.label}</span>
            </label>
          ))}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-1 w-full rounded px-2 py-2 text-left text-sm text-blue-600 hover:bg-gray-100"
            >
              Сбросить
            </button>
          )}
        </div>
      )}
    </div>
  )
}