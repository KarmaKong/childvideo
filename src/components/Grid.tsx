import type { Video } from '../types'
import Tile from './Tile'

export default function Grid({ videos }: { videos: Video[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-3 sm:gap-5">
      {videos.map((v, i) => (
        <Tile key={v.id} video={v} index={i} />
      ))}
    </div>
  )
}
