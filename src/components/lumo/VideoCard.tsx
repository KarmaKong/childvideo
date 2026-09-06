import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Video } from '../../types'
import { getSource } from '../../lib/source'
import { placeholderPoster } from '../../lib/poster'
import { useProgressStore } from '../../store/useProgressStore'
import { Play } from '../icons'
import { DurationBadge, ProgressBar } from './primitives'
import { PrimaryButton } from './Button'

function fmtDur(sec?: number) {
  if (!sec) return null
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.round(sec % 60)
  return h
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`
}

/* ---------------- VideoCard（统一尺寸：16:9 缩略图 + 2 行标题 + 副标题槽） ---------------- */
export function VideoCard({
  video,
  index = 0,
  subtitle,
}: {
  video: Video
  index?: number
  subtitle?: string
}) {
  const nav = useNavigate()
  const entry = useProgressStore((st) => st.progress[video.id])
  const [leaving, setLeaving] = useState(false)

  const poster = getSource().resolvePoster(video) ?? placeholderPoster(video.title)
  const pct = entry && entry.duration > 0 ? Math.min(100, (entry.position / entry.duration) * 100) : 0
  const sub =
    subtitle ?? (video.series && video.episode != null ? `上次看到 第${video.episode}集` : undefined)

  function open() {
    if (leaving) return
    setLeaving(true)
    setTimeout(() => nav(`/watch/${video.id}`), 150)
  }

  return (
    <button
      onClick={open}
      aria-label={video.title}
      className="press group flex w-full flex-col text-left animate-lumo-in"
      style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
    >
      <div className="relative w-full overflow-hidden rounded-card bg-lumo-soft-blue transition-transform duration-200 ease-lumo group-hover:-translate-y-1">
        <img
          src={poster}
          alt={video.title}
          loading="lazy"
          className="aspect-video w-full object-cover"
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/15">
          <span className="flex h-11 w-11 scale-90 items-center justify-center rounded-full bg-white/95 text-lumo-blue opacity-0 shadow-md transition-all group-hover:scale-100 group-hover:opacity-100">
            <Play className="h-5 w-5 translate-x-[1px]" />
          </span>
        </span>
        {fmtDur(video.duration) && (
          <span className="absolute bottom-2 right-2">
            <DurationBadge label={fmtDur(video.duration)!} />
          </span>
        )}
        {pct > 2 && (
          <span className="absolute inset-x-0 bottom-0">
            <ProgressBar value={pct} tone="yellow" className="rounded-none" />
          </span>
        )}
      </div>
      <p className="mt-2 line-clamp-2 min-h-[42px] text-[15px] font-semibold leading-tight text-lumo-ink nav:text-card">
        {video.title}
      </p>
      {sub && <p className="line-clamp-1 text-body2 text-lumo-ink/45">{sub}</p>}
    </button>
  )
}

/* ---------------- ContinueWatchingHero ----------------
   Mobile: 竖排卡片。Tablet Portrait: 45% 图 / 55% 内容，max-h 320。
   Landscape: 42% 图 / 58% 内容，高 ~248。                                */
export function ContinueWatchingHero({ video }: { video: Video }) {
  const nav = useNavigate()
  const entry = useProgressStore((st) => st.progress[video.id])
  const poster = getSource().resolvePoster(video) ?? placeholderPoster(video.title)
  const pct =
    entry && entry.duration > 0 ? Math.min(100, (entry.position / entry.duration) * 100) : 0
  const watchedMin = Math.max(1, Math.round((entry?.position ?? 0) / 60))
  const ep = video.series && video.episode != null ? `第 ${video.episode} 集` : '单集'
  const go = () => nav(`/watch/${video.id}`)

  return (
    <section className="overflow-hidden rounded-panel bg-white shadow-sm">
      <div className="flex flex-col pt:flex-row pt:max-h-[320px] nav:h-[248px] nav:max-h-none">
        <button
          onClick={go}
          aria-label={video.title}
          className="press relative w-full shrink-0 pt:w-[45%] nav:w-[42%]"
        >
          <img
            src={poster}
            alt={video.title}
            className="aspect-video h-full w-full object-cover pt:aspect-auto"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-lumo-blue shadow-md">
              <Play className="h-7 w-7 translate-x-[2px]" />
            </span>
          </span>
        </button>

        <div className="flex flex-1 flex-col justify-center gap-2.5 p-5 nav:p-6">
          <p className="text-caption font-bold uppercase tracking-wide text-lumo-blue">继续观看</p>
          <h3 className="line-clamp-2 text-title-2 leading-tight text-lumo-ink nav:text-title-1">
            {video.title}
          </h3>
          <p className="text-body2 text-lumo-ink/50">
            {ep} · 已观看 {watchedMin} 分钟
          </p>
          <div className="flex items-center gap-3">
            <span className="text-caption font-bold tabular-nums text-lumo-ink/45">
              {Math.round(pct)}%
            </span>
            <ProgressBar value={pct} tone="yellow" className="flex-1" />
          </div>
          <PrimaryButton className="mt-1 self-start" icon={<Play className="h-5 w-5" />} onClick={go}>
            继续观看
          </PrimaryButton>
        </div>
      </div>
    </section>
  )
}

/* ---------------- SectionGrid ----------------
   普通内容 Section：Mobile 2 列 / Tablet Portrait 3 列 / Landscape 恰好 4 列。
   Landscape 只显示 4 个完整卡片，不出现半张卡。                              */
export function SectionGrid({
  videos,
  subtitleOf,
}: {
  videos: Video[]
  subtitleOf?: (v: Video) => string | undefined
}) {
  if (videos.length === 0) return null
  return (
    <div
      className="grid grid-cols-2 gap-x-4 gap-y-5 pt:grid-cols-3 pt:gap-x-5 nav:grid-cols-4 nav:gap-6
                 [&>*:nth-child(n+5)]:hidden
                 pt:[&>*:nth-child(n+5)]:block pt:[&>*:nth-child(n+7)]:hidden
                 nav:[&>*:nth-child(n+5)]:hidden"
    >
      {videos.slice(0, 8).map((v, i) => (
        <VideoCard key={v.id} video={v} index={i} subtitle={subtitleOf?.(v)} />
      ))}
    </div>
  )
}

/* 全网格（分类页用，不裁行） */
export function VideoGrid({
  videos,
  subtitleOf,
}: {
  videos: Video[]
  subtitleOf?: (v: Video) => string | undefined
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-5 pt:grid-cols-3 pt:gap-x-5 nav:grid-cols-4 nav:gap-6 wide:grid-cols-5">
      {videos.map((v, i) => (
        <VideoCard key={v.id} video={v} index={i} subtitle={subtitleOf?.(v)} />
      ))}
    </div>
  )
}

/* ---------------- RecommendedCarousel ----------------
   仅「为你推荐」用。Portrait: 横滑，右侧露出 ~12% 下一张提示可滑动。
   Landscape: 直接 4 张完整卡片（转 grid，不滚动）。                          */
export function RecommendedCarousel({ videos }: { videos: Video[] }) {
  if (videos.length === 0) return null
  return (
    <div
      className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                 nav:grid nav:snap-none nav:grid-cols-4 nav:gap-6 nav:overflow-visible"
    >
      {videos.map((v, i) => (
        <div
          key={v.id}
          className={`w-[44vw] max-w-[210px] shrink-0 snap-start pt:w-[29%] nav:w-auto nav:max-w-none ${
            i >= 4 ? 'nav:hidden' : ''
          }`}
        >
          <VideoCard video={v} index={i} />
        </div>
      ))}
    </div>
  )
}
