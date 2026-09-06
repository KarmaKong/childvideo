import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Video } from '../../types'
import { getSource } from '../../lib/source'
import { placeholderPoster } from '../../lib/poster'
import { useProgressStore } from '../../store/useProgressStore'
import { Play } from '../icons'
import { DurationBadge, ProgressBar } from './primitives'
import { PrimaryButton } from './Button'

/* ---------------- VideoCard ---------------- */
export function VideoCard({ video, index = 0 }: { video: Video; index?: number }) {
  const nav = useNavigate()
  const entry = useProgressStore((st) => st.progress[video.id])
  const [leaving, setLeaving] = useState(false)

  const poster = getSource().resolvePoster(video) ?? placeholderPoster(video.title)
  const pct = entry && entry.duration > 0 ? Math.min(100, (entry.position / entry.duration) * 100) : 0

  function open() {
    if (leaving) return
    setLeaving(true)
    setTimeout(() => nav(`/watch/${video.id}`), 160)
  }

  return (
    <button
      onClick={open}
      aria-label={video.title}
      className="press group block w-full text-left animate-lumo-in"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="relative overflow-hidden rounded-video bg-lumo-soft-blue shadow-sm transition-transform duration-200 ease-lumo group-hover:-translate-y-1 group-hover:shadow-md">
        <img
          src={poster}
          alt={video.title}
          loading="lazy"
          className="aspect-video w-full object-cover"
        />
        <span className="absolute left-2.5 top-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lumo-blue shadow-sm">
          <Play className="h-5 w-5 translate-x-[1px]" />
        </span>
        {video.duration ? (
          <span className="absolute bottom-2.5 right-2.5">
            <DurationBadge seconds={video.duration} />
          </span>
        ) : null}
        {pct > 2 && (
          <span className="absolute inset-x-0 bottom-0">
            <ProgressBar value={pct} tone="yellow" className="rounded-none" />
          </span>
        )}
      </div>
      <p className="mt-2.5 line-clamp-1 px-0.5 text-card font-semibold text-lumo-cocoa">
        {video.title}
      </p>
    </button>
  )
}

/* ---------------- VideoGrid ---------------- */
export function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 px-5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {videos.map((v, i) => (
        <VideoCard key={v.id} video={v} index={i} />
      ))}
    </div>
  )
}

/* ---------------- VideoRail (横向滚动，首页各 section 用) ---------------- */
export function VideoRail({ videos }: { videos: Video[] }) {
  if (videos.length === 0) return null
  return (
    <div className="flex gap-4 overflow-x-auto px-5 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {videos.map((v, i) => (
        <div key={v.id} className="w-[160px] shrink-0 sm:w-[200px]">
          <VideoCard video={v} index={i} />
        </div>
      ))}
    </div>
  )
}

/* ---------------- ContinueWatchingCard (Home Hero) ---------------- */
export function ContinueWatchingCard({ video }: { video: Video }) {
  const nav = useNavigate()
  const entry = useProgressStore((st) => st.progress[video.id])
  const poster = getSource().resolvePoster(video) ?? placeholderPoster(video.title)
  const pct = entry && entry.duration > 0 ? Math.min(100, (entry.position / entry.duration) * 100) : 0
  const watchedMin = Math.max(1, Math.round((entry?.position ?? 0) / 60))
  const epLabel =
    video.series && video.episode != null ? `第 ${video.episode} 集` : undefined

  return (
    <div className="mx-5 overflow-hidden rounded-hero bg-lumo-paper shadow-floating">
      <div className="relative">
        <img src={poster} alt={video.title} className="aspect-[16/7] w-full object-cover" />
        <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
        <span className="absolute left-4 top-4 rounded-pill bg-white/90 px-3 py-1 text-caption font-extrabold text-lumo-blue">
          继续观看
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-page-title font-extrabold text-lumo-cocoa">{video.title}</h3>
        <p className="mt-1 text-body font-semibold text-lumo-cocoa/55">
          {epLabel ? `${epLabel} · ` : ''}已观看 {watchedMin} 分钟
        </p>
        <ProgressBar value={pct} tone="yellow" className="mt-3" />
        <PrimaryButton
          full
          className="mt-4"
          icon={<Play className="h-6 w-6" />}
          onClick={() => nav(`/watch/${video.id}`)}
        >
          继续观看
        </PrimaryButton>
      </div>
    </div>
  )
}
