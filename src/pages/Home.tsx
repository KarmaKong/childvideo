import { useNavigate } from 'react-router-dom'
import { useCatalog } from '../lib/catalog'
import { sourceMode } from '../lib/source'
import Tile from '../components/Tile'
import WorldBlock from '../components/WorldBlock'
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
    .slice(0, 6)
  const favCount = favorites
    .map((id) => byId.get(id))
    .filter((v): v is Video => !!v && visible(v)).length
  const cats = catalog.categories.filter(
    (c) => isCategoryAllowed(settings, c.id) && all.some((v) => v.category === c.id),
  )

  return (
    <div className="pb-4">
      {continueList.length > 0 && (
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

      {/* 深底「选世界」面板：先挑一个大大的分类，再进网格 */}
      <section className="world-panel mt-4 rounded-t-[2.5rem] px-5 pb-10 pt-7">
        <h2 className="mb-1 text-2xl font-black text-white">去哪个世界玩呀？</h2>
        <p className="mb-5 text-sm font-bold text-white/50">选一个大大的图标，马上开始看</p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <WorldBlock icon="🌈" label="全部" color="rainbow" onClick={() => nav('/c/all')} />
          {favCount > 0 && (
            <WorldBlock icon="⭐" label="收藏" color="#FFC23C" onClick={() => nav('/c/fav')} />
          )}
          {cats.map((c) => (
            <WorldBlock
              key={c.id}
              icon={c.icon}
              label={c.name}
              color={c.color || '#3FB9E8'}
              onClick={() => nav(`/c/${c.id}`)}
            />
          ))}
        </div>
      </section>
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
