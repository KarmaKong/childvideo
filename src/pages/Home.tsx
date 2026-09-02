import { Link } from 'react-router-dom'
import { useCatalog } from '../lib/catalog'
import { SOURCE_MODE } from '../lib/source'
import Row from '../components/Row'
import VideoCard from '../components/VideoCard'
import { isCategoryAllowed, useSettingsStore } from '../store/useSettingsStore'
import { useProgressStore } from '../store/useProgressStore'
import type { Video } from '../types'

export default function Home() {
  const { catalog, error } = useCatalog()
  const settings = useSettingsStore()
  const history = useProgressStore((s) => s.history)
  const favorites = useProgressStore((s) => s.favorites)

  if (error)
    return (
      <p className="p-6 text-center text-lg font-bold text-kid-primary">
        {error}
        <br />
        <span className="text-sm font-normal text-gray-500">
          {SOURCE_MODE === 'jellyfin'
            ? '请检查 VITE_JELLYFIN_* 配置，以及 Jellyfin 是否可访问'
            : '请检查 VITE_CDN_BASE 配置或 catalog.json 是否可访问'}
        </span>
      </p>
    )
  if (!catalog) return <Loading />

  const visible = (v: Video) =>
    isCategoryAllowed(settings, v.category) &&
    (settings.maxAge === 0 || (v.minAge ?? 0) <= settings.maxAge)

  const byId = new Map(catalog.videos.map((v) => [v.id, v]))
  const continueList = history.map((id) => byId.get(id)).filter((v): v is Video => !!v && visible(v))
  const favList = favorites.map((id) => byId.get(id)).filter((v): v is Video => !!v && visible(v))
  const cats = catalog.categories.filter((c) => isCategoryAllowed(settings, c.id))

  return (
    <div>
      {continueList.length > 0 && (
        <Row title="继续观看" icon="⏯️">
          {continueList.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </Row>
      )}

      {favList.length > 0 && (
        <Row title="我的收藏" icon="⭐">
          {favList.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </Row>
      )}

      {cats.map((cat) => {
        const vids = catalog.videos.filter((v) => v.category === cat.id && visible(v))
        if (vids.length === 0) return null
        return (
          <Row
            key={cat.id}
            title={cat.name}
            icon={cat.icon}
            action={
              <Link to={`/c/${cat.id}`} className="text-sm font-bold text-kid-accent">
                全部 ›
              </Link>
            }
          >
            {vids.slice(0, 12).map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </Row>
        )
      })}

      {cats.length === 0 && (
        <p className="p-10 text-center text-gray-500">
          家长已隐藏全部分类，请在「家长」设置中开启。
        </p>
      )}
    </div>
  )
}

function Loading() {
  return (
    <div className="flex flex-col items-center justify-center p-20 text-gray-400">
      <div className="animate-bounce text-5xl">🍿</div>
      <p className="mt-3 font-bold">正在加载片库…</p>
    </div>
  )
}
