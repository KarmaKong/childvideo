import { useNavigate } from 'react-router-dom'
import type { Video } from '../types'
import Tile from './Tile'

const SHELF_CAP = 16

/**
 * 一条 Infuse 风横滑片架：标题行（可选「更多」）+ 横向滚动海报。
 */
export default function Shelf({
  icon,
  title,
  videos,
  linkTo,
}: {
  icon?: string
  title: string
  videos: Video[]
  linkTo?: string
}) {
  const nav = useNavigate()
  if (videos.length === 0) return null
  const shown = videos.slice(0, SHELF_CAP)
  const hasMore = linkTo && videos.length > SHELF_CAP

  return (
    <section className="pt-5">
      <div className="mb-2 flex items-center justify-between px-4">
        <h2 className="flex items-center gap-1.5 text-lg font-black text-white/90">
          {icon && <span>{icon}</span>}
          {title}
        </h2>
        {(hasMore || linkTo) && (
          <button
            className="press shrink-0 text-sm font-extrabold text-lumo-amber"
            onClick={() => linkTo && nav(linkTo)}
          >
            更多 ›
          </button>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {shown.map((v, i) => (
          <div key={v.id} className="w-36 shrink-0 sm:w-44">
            <Tile video={v} index={i} />
          </div>
        ))}
      </div>
    </section>
  )
}
