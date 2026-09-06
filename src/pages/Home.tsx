import { useNavigate } from 'react-router-dom'
import { useCatalog } from '../lib/catalog'
import { sourceMode } from '../lib/source'
import TopBar from '../components/TopBar'
import {
  SectionHeader,
  Panel,
  CategoryTile,
  VideoRow,
  LoadingState,
  EmptyState,
} from '../components/lumo'
import { SparkIcon } from '../components/icons'
import { isCategoryAllowed, useSettingsStore } from '../store/useSettingsStore'
import { useProgressStore } from '../store/useProgressStore'
import type { Video } from '../types'

const CAT_EMOJI: Record<string, string> = {
  动画: '🎬',
  cartoon: '🎬',
  儿歌: '🎵',
  nursery: '🎵',
  英语: '🔤',
  english: '🔤',
  科普: '🔬',
  science: '🔬',
  益智: '🧩',
  故事: '📖',
  story: '📖',
}
const TINT_CYCLE = ['coral', 'blue', 'purple', 'green', 'yellow', 'purple', 'coral']

export default function Home() {
  const nav = useNavigate()
  const { catalog, error } = useCatalog()
  const settings = useSettingsStore()
  const history = useProgressStore((s) => s.history)
  const progress = useProgressStore((s) => s.progress)

  if (error)
    return (
      <EmptyState
        pose="peek"
        title="片库没连上"
        hint={
          sourceMode() === 'jellyfin'
            ? '检查 config.json 的 jellyfin 配置，以及 Jellyfin 是否可访问'
            : '检查 VITE_CDN_BASE 或 catalog.json 是否可访问'
        }
      />
    )
  if (!catalog) return <LoadingState />

  const visible = (v: Video) =>
    isCategoryAllowed(settings, v.category) &&
    (settings.maxAge === 0 || (v.minAge ?? 0) <= settings.maxAge)

  const all = catalog.videos.filter(visible)
  const byId = new Map(catalog.videos.map((v) => [v.id, v]))
  const recent = history.map((id) => byId.get(id)).filter((v): v is Video => !!v && visible(v))

  // 为你推荐：优先「有进度、没看完」的，再补新的
  const inProgress = recent.filter((v) => {
    const e = progress[v.id]
    return e && e.position > 5 && e.duration > 0 && e.position < e.duration - 10
  })
  const fill = all.filter((v) => !inProgress.some((r) => r.id === v.id)).slice(0, 8)
  const recommend = [...inProgress, ...fill].slice(0, 10)

  const cats = catalog.categories.filter(
    (c) => isCategoryAllowed(settings, c.id) && all.some((v) => v.category === c.id),
  )

  if (all.length === 0)
    return (
      <>
        <TopBar />
        <div className="px-4 sm:px-5">
          <EmptyState pose="box" title="片库还是空的" hint="家长在片库里加几个视频就好啦" />
        </div>
      </>
    )

  return (
    <div className="flex flex-col gap-4 pb-4">
      <TopBar />

      <div className="flex flex-col gap-4 px-4 sm:px-5">
        <Panel>
          <SectionHeader
            title="为你推荐"
            icon={<SparkIcon className="h-5 w-5 text-lumo-yellow" />}
            onMore={() => nav('/discover')}
            className="mb-3"
          />
          <VideoRow videos={recommend} />
        </Panel>

        {cats.length > 0 && (
          <Panel>
            <SectionHeader
              title="热门分类"
              icon={<SparkIcon className="h-5 w-5 text-lumo-yellow" />}
              onMore={() => nav('/discover')}
              className="mb-3"
            />
            <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <CategoryTile label="全部" emoji="🗂️" tint="blue" onClick={() => nav('/discover')} />
              {cats.map((c, i) => (
                <CategoryTile
                  key={c.id}
                  label={c.name}
                  emoji={CAT_EMOJI[c.id] || CAT_EMOJI[c.name] || c.icon || '🎈'}
                  tint={TINT_CYCLE[i % TINT_CYCLE.length]}
                  onClick={() => nav(`/c/${c.id}`)}
                />
              ))}
            </div>
          </Panel>
        )}

        {cats.map((c) => {
          const vids = all.filter((v) => v.category === c.id)
          if (vids.length === 0) return null
          return (
            <Panel key={c.id}>
              <SectionHeader
                title={c.name}
                icon={<span className="text-xl leading-none">{c.icon}</span>}
                onMore={() => nav(`/c/${c.id}`)}
                className="mb-3"
              />
              <VideoRow videos={vids.slice(0, 12)} />
            </Panel>
          )
        })}
      </div>
    </div>
  )
}
