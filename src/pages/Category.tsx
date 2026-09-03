import { useNavigate, useParams } from 'react-router-dom'
import { useCatalog } from '../lib/catalog'
import Grid from '../components/Grid'
import { isCategoryAllowed, useSettingsStore } from '../store/useSettingsStore'
import { useProgressStore } from '../store/useProgressStore'
import { ChevLeft } from '../components/icons'
import type { Video } from '../types'

/**
 * 「A 网格」：从首页某个世界块点进来后看到的页面。
 * categoryId 支持三种：真实分类 id / 'all'（全部）/ 'fav'（收藏）。
 */
export default function CategoryPage() {
  const { categoryId = '' } = useParams()
  const nav = useNavigate()
  const { catalog } = useCatalog()
  const settings = useSettingsStore()
  const favorites = useProgressStore((s) => s.favorites)

  if (!catalog)
    return <p className="p-16 text-center text-lg font-black text-ink/40">加载中…</p>

  const isAll = categoryId === 'all'
  const isFav = categoryId === 'fav'

  const visible = (v: Video) =>
    isCategoryAllowed(settings, v.category) &&
    (settings.maxAge === 0 || (v.minAge ?? 0) <= settings.maxAge)

  const cat = !isAll && !isFav ? catalog.categories.find((c) => c.id === categoryId) : undefined
  const allowed = isAll || isFav || isCategoryAllowed(settings, categoryId)

  const byId = new Map(catalog.videos.map((v) => [v.id, v]))
  const vids: Video[] = isAll
    ? catalog.videos.filter(visible)
    : isFav
      ? favorites.map((id) => byId.get(id)).filter((v): v is Video => !!v && visible(v))
      : catalog.videos.filter((v) => v.category === categoryId && visible(v))

  const icon = isAll ? '🌈' : isFav ? '⭐' : cat?.icon
  const title = isAll ? '全部' : isFav ? '收藏' : (cat?.name ?? '分类')

  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 px-4 py-4">
        <button onClick={() => nav('/')} className="btn-round h-12 w-12" aria-label="返回">
          <ChevLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-black">
          {icon} {title}
        </h1>
      </div>

      {!allowed ? (
        <p className="p-16 text-center font-black text-ink/40">这个分类被藏起来啦</p>
      ) : vids.length === 0 ? (
        <p className="p-16 text-center font-black text-ink/40">
          {isFav ? '还没有收藏，点视频右上角小星星试试吧' : '这里还没有视频'}
        </p>
      ) : (
        <Grid videos={vids} />
      )}
    </div>
  )
}
