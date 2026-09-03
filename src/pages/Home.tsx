import { useState } from 'react'
import { useCatalog } from '../lib/catalog'
import { sourceMode } from '../lib/source'
import Grid from '../components/Grid'
import Tile from '../components/Tile'
import CategoryBubble from '../components/CategoryBubble'
import { isCategoryAllowed, useSettingsStore } from '../store/useSettingsStore'
import { useProgressStore } from '../store/useProgressStore'
import type { Video } from '../types'

export default function Home() {
  const { catalog, error } = useCatalog()
  const settings = useSettingsStore()
  const history = useProgressStore((s) => s.history)
  const favorites = useProgressStore((s) => s.favorites)
  const [filter, setFilter] = useState<string>('all')

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
    .slice(0, 6)
  const favList = favorites.map((id) => byId.get(id)).filter((v): v is Video => !!v && visible(v))
  const cats = catalog.categories.filter(
    (c) => isCategoryAllowed(settings, c.id) && all.some((v) => v.category === c.id),
  )

  const shown =
    filter === 'all' ? all : filter === 'fav' ? favList : all.filter((v) => v.category === filter)

  return (
    <div className="pb-12">
      {continueList.length > 0 && filter === 'all' && (
        <section className="pt-3">
          <h2 className="mb-2 px-4 text-lg font-black text-ink/80">▶ 继续看</h2>
          <div className="flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {continueList.map((v, i) => (
              <div key={v.id} className="w-44 shrink-0 sm:w-52">
                <Tile video={v} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {(cats.length > 0 || favList.length > 0) && (
        <div className="flex gap-4 overflow-x-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <CategoryBubble
            icon="🌈"
            label="全部"
            color="#FF7A59"
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          {favList.length > 0 && (
            <CategoryBubble
              icon="⭐"
              label="收藏"
              color="#FFC23C"
              active={filter === 'fav'}
              onClick={() => setFilter('fav')}
            />
          )}
          {cats.map((c) => (
            <CategoryBubble
              key={c.id}
              icon={c.icon}
              label={c.name}
              color={c.color || '#3FB9E8'}
              active={filter === c.id}
              onClick={() => setFilter(c.id)}
            />
          ))}
        </div>
      )}

      {shown.length > 0 ? (
        <Grid videos={shown} />
      ) : (
        <Splash emoji="🐣" text={filter === 'fav' ? '还没有收藏' : '这里还没有视频'} />
      )}
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
    <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
      <div className={`text-6xl ${bounce ? 'animate-bounce' : ''}`}>{emoji}</div>
      <p className="max-w-xs text-lg font-black text-ink/80">{text}</p>
      {sub && <p className="max-w-xs text-sm font-bold text-ink/40">{sub}</p>}
    </div>
  )
}
