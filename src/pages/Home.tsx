import { useNavigate } from 'react-router-dom'
import { useCatalog } from '../lib/catalog'
import { sourceMode } from '../lib/source'
import Shelf from '../components/Shelf'
import { isCategoryAllowed, useSettingsStore } from '../store/useSettingsStore'
import { useProgressStore } from '../store/useProgressStore'
import type { Video } from '../types'

export default function Home() {
  const nav = useNavigate()
  const { catalog, error } = useCatalog()
  const settings = useSettingsStore()
  const history = useProgressStore((s) => s.history)
  const favorites = useProgressStore((s) => s.favorites)

  if (error) return <Splash emoji="🌧️" text={error} sub={hint()} />
  if (!catalog) return <Splash emoji="🍿" text="正在准备好看的…" bounce />

  const visible = (v: Video) =>
    isCategoryAllowed(settings, v.category) &&
    (settings.maxAge === 0 || (v.minAge ?? 0) <= settings.maxAge)

  const all = catalog.videos.filter(visible)
  const byId = new Map(catalog.videos.map((v) => [v.id, v]))
  const continueList = history
    .map((id) => byId.get(id))
    .filter((v): v is Video => !!v && visible(v))
  const favList = favorites.map((id) => byId.get(id)).filter((v): v is Video => !!v && visible(v))
  const cats = catalog.categories.filter(
    (c) => isCategoryAllowed(settings, c.id) && all.some((v) => v.category === c.id),
  )

  return (
    <div className="cinema-bg min-h-screen pb-12">
      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        {favList.length > 0 && (
          <button
            className="press flex items-center gap-2 rounded-blob bg-lumo-amber px-4 py-5 text-lumo-night shadow-toysm"
            onClick={() => nav('/c/fav')}
          >
            <span className="text-3xl leading-none">⭐</span>
            <span className="text-lg font-black">收藏</span>
          </button>
        )}
        <button
          className={`press flex items-center gap-2 rounded-blob bg-lumo-blue px-4 py-5 text-white shadow-toysm ${
            favList.length > 0 ? '' : 'col-span-2'
          }`}
          onClick={() => nav('/c/all')}
        >
          <span className="text-3xl leading-none">🍿</span>
          <span className="text-lg font-black">全部影片</span>
        </button>
      </div>

      <Shelf icon="▶" title="继续看" videos={continueList} />
      {cats.map((c) => (
        <Shelf
          key={c.id}
          icon={c.icon}
          title={c.name}
          videos={all.filter((v) => v.category === c.id)}
          linkTo={`/c/${c.id}`}
        />
      ))}
    </div>
  )
}

function hint() {
  return sourceMode() === 'jellyfin'
    ? '请检查 config.json 的 jellyfin 配置，以及 Jellyfin 是否可访问'
    : '请检查 VITE_CDN_BASE 配置或 catalog.json 是否可访问'
}

function Splash({
  emoji,
  text,
  sub,
  bounce,
}: {
  emoji: string
  text: string
  sub?: string
  bounce?: boolean
}) {
  return (
    <div className="cinema-bg flex min-h-screen flex-col items-center justify-center gap-3 p-16 text-center">
      <div className={`text-6xl ${bounce ? 'animate-bounce' : ''}`}>{emoji}</div>
      <p className="max-w-xs text-lg font-black text-white/85">{text}</p>
      {sub && <p className="max-w-xs text-sm font-bold text-white/40">{sub}</p>}
    </div>
  )
}
