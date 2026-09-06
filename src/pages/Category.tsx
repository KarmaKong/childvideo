import { useNavigate, useParams } from 'react-router-dom'
import { useCatalog } from '../lib/catalog'
import Grid from '../components/Grid'
import { isCategoryAllowed, useSettingsStore } from '../store/useSettingsStore'
import { useProgressStore } from '../store/useProgressStore'
import { ChevLeft } from '../components/icons'
import type { Video } from '../types'

const ALL_BG = 'linear-gradient(135deg,#2E6BE6,#7C5CE0)'

/**
 * 某个片架点「更多」/ 收藏 / 全部 的落地页：通栏色块 banner + 深底密集海报网格。
 * categoryId 支持三种：真实分类 id / 'all'（全部）/ 'fav'（收藏）。
 * 参考 Spotify Kids 的 Explore 分类列表：进哪个分类，banner 就是那个分类自己的颜色，一眼能认出来。
 */
export default function CategoryPage() {
  const { categoryId = '' } = useParams()
  const nav = useNavigate()
  const { catalog } = useCatalog()
  const settings = useSettingsStore()
  const favorites = useProgressStore((s) => s.favorites)

  if (!catalog)
    return (
      <p className="cinema-bg min-h-screen p-16 text-center text-lg font-black text-lumo-cocoa/40">
        加载中…
      </p>
    )

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

  const icon = isAll ? '🍿' : isFav ? '⭐' : cat?.icon
  const title = isAll ? '全部影片' : isFav ? '收藏' : (cat?.name ?? '分类')
  const bannerBg = isAll ? ALL_BG : isFav ? '#FFC02E' : cat?.color || '#2E6BE6'
  const onAmber = isFav // 琥珀底用深色字
  const bannerText = onAmber ? 'text-lumo-night' : 'text-white'

  return (
    <div className="cinema-bg min-h-screen pb-12">
      <div
        className="rounded-b-[2rem] px-4 pb-7 pt-4 shadow-toy"
        style={{ background: bannerBg }}
      >
        <button onClick={() => nav('/')} className="btn-round h-11 w-11" aria-label="返回">
          <ChevLeft className="h-6 w-6" />
        </button>
        <div className={`mt-4 flex items-center gap-3 ${bannerText}`}>
          <span className="text-5xl leading-none drop-shadow-sm">{icon}</span>
          <h1 className="text-3xl font-black drop-shadow-sm">{title}</h1>
        </div>
      </div>

      {!allowed ? (
        <p className="p-16 text-center font-black text-lumo-cocoa/40">这个分类被藏起来啦</p>
      ) : vids.length === 0 ? (
        <p className="p-16 text-center font-black text-lumo-cocoa/40">
          {isFav ? '还没有收藏，点视频右上角小星星试试吧' : '这里还没有视频'}
        </p>
      ) : (
        <div className="pt-5">
          <Grid videos={vids} />
        </div>
      )}
    </div>
  )
}
