import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCatalog } from '../lib/catalog'
import { VideoGrid, LoadingState, EmptyState, CategoryChip } from '../components/lumo'
import { ChevLeft, FilterIcon } from '../components/icons'
import { isCategoryAllowed, useSettingsStore } from '../store/useSettingsStore'
import { useProgressStore } from '../store/useProgressStore'
import { TAXONOMY, videosInTax } from '../lib/taxonomy'
import type { Video } from '../types'

type Sort = 'all' | 'new' | 'progress'
const SORTS: { id: Sort; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'new', label: '最近上新' },
  { id: 'progress', label: '在看' },
]

export default function CategoryPage() {
  const { categoryId = '' } = useParams()
  const nav = useNavigate()
  const { catalog } = useCatalog()
  const settings = useSettingsStore()
  const favorites = useProgressStore((s) => s.favorites)
  const progress = useProgressStore((s) => s.progress)
  const [sort, setSort] = useState<Sort>('all')

  const isAll = categoryId === 'all'
  const isFav = categoryId === 'fav'
  const taxKey = categoryId.startsWith('tax-') ? categoryId.slice(4) : ''

  const base = useMemo<Video[]>(() => {
    if (!catalog) return []
    const visible = (v: Video) =>
      isCategoryAllowed(settings, v.category) &&
      (settings.maxAge === 0 || (v.minAge ?? 0) <= settings.maxAge)
    const byId = new Map(catalog.videos.map((v) => [v.id, v]))
    if (isFav) return favorites.map((id) => byId.get(id)).filter((v): v is Video => !!v && visible(v))
    if (isAll) return catalog.videos.filter(visible)
    if (taxKey) return videosInTax(catalog, taxKey, catalog.videos.filter(visible))
    return catalog.videos.filter((v) => v.category === categoryId && visible(v))
  }, [catalog, categoryId, isAll, isFav, taxKey, favorites, settings])

  if (!catalog) return <LoadingState />

  const cat = !isAll && !isFav && !taxKey ? catalog.categories.find((c) => c.id === categoryId) : undefined
  const title = isAll
    ? '全部影片'
    : isFav
      ? '我的收藏'
      : taxKey
        ? (TAXONOMY.find((t) => t.key === taxKey)?.label ?? '分类')
        : (cat?.name ?? '分类')
  const allowed = isAll || isFav || !!taxKey || isCategoryAllowed(settings, categoryId)

  let vids = base
  if (sort === 'new') vids = [...base].sort((a, b) => (a.id < b.id ? 1 : -1))
  if (sort === 'progress') vids = base.filter((v) => (progress[v.id]?.position ?? 0) > 5)

  const epCount = new Map<string, number>()
  for (const v of catalog.videos) if (v.series) epCount.set(v.series, (epCount.get(v.series) ?? 0) + 1)
  const subtitleOf = (v: Video) =>
    v.series && epCount.get(v.series)! > 1 ? `共${epCount.get(v.series)}集` : undefined

  return (
    <div className="flex flex-col gap-5 px-4 pt-5 pt:px-6 ipad:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => nav(-1)}
          className="btn-icon"
          aria-label="返回"
        >
          <ChevLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 truncate text-title-1 text-lumo-ink">{title}</h1>
        {!isFav && (
          <button className="btn-icon" aria-label="筛选" onClick={() => setSort('all')}>
            <FilterIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {!isFav && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SORTS.map((s) => (
            <CategoryChip
              key={s.id}
              label={s.label}
              active={sort === s.id}
              onClick={() => setSort(s.id)}
            />
          ))}
        </div>
      )}

      {!allowed ? (
        <EmptyState pose="peek" title="这个分类被藏起来啦" />
      ) : vids.length === 0 ? (
        <EmptyState
          pose={isFav ? 'box' : 'peek'}
          title={isFav ? '这里还没有收藏的视频哦' : '这里还没有视频'}
          hint={isFav ? '看视频时点右上角的星星就能收藏' : undefined}
        />
      ) : (
        <VideoGrid videos={vids} subtitleOf={subtitleOf} />
      )}
    </div>
  )
}
