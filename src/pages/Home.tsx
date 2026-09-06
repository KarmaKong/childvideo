import { useNavigate } from 'react-router-dom'
import { useCatalog } from '../lib/catalog'
import { sourceMode } from '../lib/source'
import TopBar from '../components/TopBar'
import {
  SectionHeader,
  VideoRail,
  ContinueWatchingCard,
  LoadingState,
  EmptyState,
} from '../components/lumo'
import { SparkIcon, CartoonIcon, LearnIcon, ClockIcon } from '../components/icons'
import { isCategoryAllowed, useSettingsStore } from '../store/useSettingsStore'
import { useProgressStore } from '../store/useProgressStore'
import type { Video } from '../types'

const LEARN_CATS = ['science', '科普', 'english', '英语', 'learn', '学习']

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

  // Continue Watching：最近一条且有真实进度
  const hero = recent.find((v) => {
    const e = progress[v.id]
    return e && e.position > 5 && e.duration > 0 && e.position < e.duration - 10
  })

  const picks = [...all].sort((a, b) => (a.id > b.id ? 1 : -1)).slice(0, 6)
  const cartoonCat = catalog.categories.find(
    (c) => isCategoryAllowed(settings, c.id) && /cartoon|动画/i.test(c.id + c.name),
  )
  const cartoons = cartoonCat ? all.filter((v) => v.category === cartoonCat.id) : []
  const learnCat = catalog.categories.find(
    (c) => isCategoryAllowed(settings, c.id) && LEARN_CATS.some((k) => (c.id + c.name).includes(k)),
  )
  const learn = learnCat ? all.filter((v) => v.category === learnCat.id) : []

  if (all.length === 0)
    return (
      <>
        <TopBar />
        <EmptyState pose="box" title="片库还是空的" hint="家长在片库里加几个视频就好啦" />
      </>
    )

  return (
    <div className="flex flex-col gap-7 pb-4">
      <TopBar />

      {hero && (
        <section>
          <ContinueWatchingCard video={hero} />
        </section>
      )}

      {recent.length > 0 && (
        <section>
          <SectionHeader title="最近看过" icon={<ClockIcon className="h-5 w-5 text-lumo-blue" />} />
          <div className="mt-3">
            <VideoRail videos={recent.slice(0, 8)} />
          </div>
        </section>
      )}

      <section>
        <SectionHeader
          title="今日推荐"
          icon={<SparkIcon className="h-5 w-5 text-lumo-yellow" />}
          onMore={() => nav('/discover')}
        />
        <div className="mt-3">
          <VideoRail videos={picks} />
        </div>
      </section>

      {cartoons.length > 0 && (
        <section>
          <SectionHeader
            title="动画片"
            icon={<CartoonIcon className="h-5 w-5 text-lumo-coral" />}
            onMore={() => cartoonCat && nav(`/c/${cartoonCat.id}`)}
          />
          <div className="mt-3">
            <VideoRail videos={cartoons.slice(0, 8)} />
          </div>
        </section>
      )}

      {learn.length > 0 && (
        <section>
          <SectionHeader
            title="学点新东西"
            icon={<LearnIcon className="h-5 w-5 text-lumo-mint" />}
            onMore={() => learnCat && nav(`/c/${learnCat.id}`)}
          />
          <div className="mt-3">
            <VideoRail videos={learn.slice(0, 8)} />
          </div>
        </section>
      )}
    </div>
  )
}
