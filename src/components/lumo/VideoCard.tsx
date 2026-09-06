import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Video } from '../../types'
import { getSource } from '../../lib/source'
import { placeholderPoster } from '../../lib/poster'
import { useProgressStore } from '../../store/useProgressStore'
import { Play } from '../icons'
import { DurationBadge, ProgressBar } from './primitives'

function fmtDur(sec?: number) {
  if (!sec) return null
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.round(sec % 60)
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`
}

/* ---------------- VideoCard ---------------- */
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
    subtitle ??
    (video.series && video.episode != null ? `上次看到 第${video.episode}集` : undefined)

  function open() {
    if (leaving) return
    setLeaving(true)
    setTimeout(() => nav(`/watch/${video.id}`), 150)
  }

  return (
    <button
      onClick={open}
      aria-label={video.title}
      className="press group block w-full text-left animate-lumo-in"
      style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
    >
      <div className="relative overflow-hidden rounded-md bg-lumo-soft-blue transition-transform duration-200 ease-lumo group-hover:-translate-y-1">
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
      <p className="mt-2 line-clamp-1 text-card font-semibold text-lumo-ink">{video.title}</p>
      {sub && <p className="mt-0.5 line-clamp-1 text-body2 text-lumo-ink/45">{sub}</p>}
    </button>
  )
}

/* ---------------- VideoGrid ---------------- */
export function VideoGrid({
  videos,
  subtitleOf,
}: {
  videos: Video[]
  subtitleOf?: (v: Video) => string | undefined
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
      {videos.map((v, i) => (
        <VideoCard key={v.id} video={v} index={i} subtitle={subtitleOf?.(v)} />
      ))}
    </div>
  )
}

/* ---------------- VideoRow（面板内一行，横向滚动） ---------------- */
export function VideoRow({
  videos,
  subtitleOf,
}: {
  videos: Video[]
  subtitleOf?: (v: Video) => string | undefined
}) {
  if (videos.length === 0) return null
  return (
    <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {videos.map((v, i) => (
        <div key={v.id} className="w-[180px] shrink-0 sm:w-[212px]">
          <VideoCard video={v} index={i} subtitle={subtitleOf?.(v)} />
        </div>
      ))}
    </div>
  )
}
