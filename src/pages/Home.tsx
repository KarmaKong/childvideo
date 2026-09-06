import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCatalog } from '../lib/catalog'
import { sourceMode } from '../lib/source'
import { TAXONOMY, videosInTax } from '../lib/taxonomy'
import TopBar from '../components/TopBar'
import {
  SectionHeader,
  CategoryTile,
  SectionGrid,
  RecommendedCarousel,
  ContinueWatchingHero,
  LoadingState,
  EmptyState,
} from '../components/lumo'
import {
  SparkIcon,
  ClockIcon,
  SongsIcon,
  CartoonIcon,
  EnglishIcon,
  ScienceIcon,
  StoryIcon,
  PuzzleIcon,
  MusicIcon,
} from '../components/icons'
import { isCategoryAllowed, useSettingsStore } from '../store/useSettingsStore'
import { useProgressStore } from '../store/useProgressStore'
import type { Video } from '../types'

const B = import.meta.env.BASE_URL
const SVG_FOR: Record<string, string> = {
  songs: 'music',
  cartoon: 'cartoons',
  english: 'learn',
  science: 'science',
  story: 'stories',
  puzzle: 'learn',
  music: 'music',
}
const ICON_FOR: Record<string, (p: { className?: string }) => JSX.Element> = {
  songs: (p) => <SongsIcon {...p} />,
  cartoon: (p) => <CartoonIcon {...p} />,
  english: (p) => <EnglishIcon {...p} />,
  science: (p) => <ScienceIcon {...p} />,
  story: (p) => <StoryIcon {...p} />,
  puzzle: (p) => <PuzzleIcon {...p} />,
  music: (p) => <MusicIcon {...p} />,
}
const TINT_FOR: Record<string, string> = {
  songs: 'coral',
  cartoon: 'blue',
  english: 'purple',
  science: 'green',
  story: 'yellow',
  puzzle: 'purple',
  music: 'coral',
}
// 首页 section 顺序（优先几个立即渲染，其余延后）
const PRIORITY = ['songs', 'science']
const LATER = ['cartoon', 'english', 'story', 'puzzle', 'music']

export default function Home() {
  const nav = useNavigate()
  const { catalog, error } = useCatalog()
  const settings = useSettingsStore()
  const history = useProgressStore((s) => s.history)
  const progress = useProgressStore((s) => s.progress)
  const [showLater, setShowLater] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setShowLater(true), 80)
    return () => window.clearTimeout(id)
  }, [])

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

  const inProgress = recent.filter((v) => {
    const e = progress[v.id]
    return e && e.position > 5 && e.duration > 0 && e.position < e.duration - 10
  })
  const hero = inProgress[0]
  const recommend = [
    ...inProgress.filter((v) => v.id !== hero?.id),
    ...all.filter((v) => v.id !== hero?.id),
  ]
    .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
    .slice(0, 12)

  const taxVids = new Map(TAXONOMY.map((t) => [t.key, videosInTax(catalog, t.key, all)]))
  const section = (key: string) => {
    const vids = taxVids.get(key) ?? []
    if (vids.length === 0) return null
    const t = TAXONOMY.find((x) => x.key === key)!
    const Icon = ICON_FOR[key]
    return (
      <section key={key}>
        <SectionHeader
          title={t.label}
          icon={<Icon className="h-5 w-5 text-lumo-blue" />}
          onMore={() => nav(`/c/tax-${key}`)}
          className="mb-3"
        />
        <SectionGrid videos={vids} />
      </section>
    )
  }

  if (all.length === 0)
    return (
      <>
        <TopBar />
        <div className="px-4 pt:px-6 ipad:px-8">
          <EmptyState pose="box" title="片库还是空的" hint="家长在片库里加几个视频就好啦" />
        </div>
      </>
    )

  return (
    <div className="flex flex-col gap-6 pb-6 nav:gap-8">
      <TopBar />

      <div className="flex flex-col gap-8 px-4 pt:px-6 ipad:px-8 nav:px-8">
        {hero && <ContinueWatchingHero video={hero} />}

        <section>
          <SectionHeader
            title="为你推荐"
            icon={<SparkIcon className="h-5 w-5 text-lumo-yellow" />}
            onMore={() => nav('/discover')}
            className="mb-3"
          />
          <RecommendedCarousel videos={recommend} />
        </section>

        <section>
          <SectionHeader title="热门分类" icon={<SparkIcon className="h-5 w-5 text-lumo-yellow" />} className="mb-3" />
          <div className="flex gap-2 overflow-x-auto pb-1 pt:flex-wrap pt:overflow-visible nav:flex-nowrap nav:overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <CategoryTile label="全部" emoji="🗂️" tint="blue" onClick={() => nav('/discover')} />
            {TAXONOMY.map((t) => (
              <CategoryTile
                key={t.key}
                label={t.label}
                illust={`${B}illust/category/category-${SVG_FOR[t.key]}.svg`}
                tint={TINT_FOR[t.key]}
                onClick={() => nav(`/c/tax-${t.key}`)}
              />
            ))}
          </div>
        </section>

        {PRIORITY.map(section)}
        {showLater && LATER.map(section)}

        {recent.length > 0 && showLater && (
          <section>
            <SectionHeader
              title="最近看过"
              icon={<ClockIcon className="h-5 w-5 text-lumo-blue" />}
              onMore={() => nav('/me')}
              className="mb-3"
            />
            <SectionGrid videos={recent} />
          </section>
        )}
      </div>
    </div>
  )
}
