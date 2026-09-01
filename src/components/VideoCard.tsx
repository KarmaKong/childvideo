import { Link } from 'react-router-dom'
import type { Video } from '../types'
import { assetUrl } from '../config'
import { placeholderPoster } from '../lib/poster'
import { useProgressStore } from '../store/useProgressStore'

function fmtDur(sec?: number): string | null {
  if (!sec) return null
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function VideoCard({ video }: { video: Video }) {
  const entry = useProgressStore((st) => st.progress[video.id])
  const poster = video.poster ? assetUrl(video.poster) : placeholderPoster(video.title)
  const dur = fmtDur(video.duration)
  const pct =
    entry && entry.duration > 0 ? Math.min(100, (entry.position / entry.duration) * 100) : 0

  return (
    <Link
      to={`/watch/${video.id}`}
      className="group block w-40 shrink-0 sm:w-48"
      aria-label={video.title}
    >
      <div className="relative overflow-hidden rounded-blob shadow-md transition-transform group-active:scale-95">
        <img
          src={poster}
          alt=""
          loading="lazy"
          className="aspect-video w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10">
          <span className="text-4xl opacity-0 drop-shadow group-hover:opacity-100">▶️</span>
        </div>
        {dur && (
          <span className="absolute bottom-1 right-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-white">
            {dur}
          </span>
        )}
        {pct > 2 && (
          <span
            className="absolute bottom-0 left-0 h-1.5 bg-kid-primary"
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
      <p className="mt-2 line-clamp-2 px-1 text-sm font-bold leading-snug">{video.title}</p>
    </Link>
  )
}
