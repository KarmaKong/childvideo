import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Video } from '../types'
import { getSource } from '../lib/source'
import { placeholderPoster } from '../lib/poster'
import { useProgressStore } from '../store/useProgressStore'
import { Play } from './icons'

const RING = ['#FF7A59', '#3FB9E8', '#4BC673', '#9B7BF0', '#FFC23C', '#FF7FB0']
function ringColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return RING[h % RING.length]
}

export default function Tile({ video, index = 0 }: { video: Video; index?: number }) {
  const nav = useNavigate()
  const entry = useProgressStore((st) => st.progress[video.id])
  const [burst, setBurst] = useState(false)

  const poster = getSource().resolvePoster(video) ?? placeholderPoster(video.title)
  const pct =
    entry && entry.duration > 0 ? Math.min(100, (entry.position / entry.duration) * 100) : 0
  const color = ringColor(video.id)

  function open() {
    if (burst) return
    setBurst(true)
    setTimeout(() => nav(`/watch/${video.id}`), 190)
  }

  return (
    <button
      onClick={open}
      aria-label={video.title}
      className="press group block w-full text-left animate-pop"
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
    >
      <div
        className="relative overflow-hidden rounded-blob shadow-toysm"
        style={{ border: `5px solid ${color}` }}
      >
        <img src={poster} alt="" loading="lazy" className="aspect-video w-full object-cover" />

        {/* 常驻小播放角标 */}
        <span
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-ink shadow"
          aria-hidden
        >
          <Play className="h-5 w-5 translate-x-[1px]" />
        </span>

        {pct > 2 && (
          <span className="absolute inset-x-0 bottom-0 h-2 bg-black/20">
            <span className="block h-full" style={{ width: `${pct}%`, background: color }} />
          </span>
        )}

        {/* 点按时的放大播放圈 */}
        {burst && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/25">
            <span className="flex h-20 w-20 animate-bloom items-center justify-center rounded-full bg-white text-ink">
              <Play className="h-10 w-10 translate-x-[2px]" />
            </span>
          </span>
        )}
      </div>

      <p className="mt-2 line-clamp-1 px-1 text-[15px] font-extrabold text-ink/85">
        {video.title}
      </p>
    </button>
  )
}
