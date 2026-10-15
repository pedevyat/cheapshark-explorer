import { useMemo, useState } from 'react'
import MultiSelect from './MultiSelect'
import { useStores } from '../hooks/useStores'
import { storeImageUrl } from '../api/cheapshark'
import { TAGS, applyTags } from '../utils/tags'
import type { DealsParams } from '../api/types'

interface Props {
  onChange: (params: DealsParams) => void
}

export default function SearchForm({ onChange }: Props) {
  const stores = useStores()
  const [title, setTitle] = useState('')
  const [tagIds, setTagIds] = useState<string[]>([])
  const [storeIds, setStoreIds] = useState<string[]>([])

  const storeOptions = useMemo(
    () =>
      (stores.data ?? []).map((s) => ({
        value: s.storeID,
        label: s.storeName,
        icon: storeImageUrl(s.images.icon),
      })),
    [stores.data],
  )

  const tagOptions = useMemo(() => TAGS.map((t) => ({ value: t.id, label: t.label })), [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onChange(
      applyTags(
        { title: title.trim() || undefined, storeID: storeIds, pageNumber: 0 },
        tagIds,
      ),
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название игры"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:w-64"
      />
      <MultiSelect label="Категории" options={tagOptions} selected={tagIds} onChange={setTagIds} />
      <MultiSelect
        label="Магазины"
        options={storeOptions}
        selected={storeIds}
        onChange={setStoreIds}
        loading={stores.isPending}
      />
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Найти
      </button>
    </form>
  )
}