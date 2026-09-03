import type { Video } from '../types'
import Tile from './Tile'

export default function Grid({ videos }: { videos: Video[] }) {
  return (
    <div className="grid grid-cols-3 gap-3 px-4 sm:grid-cols-4 sm:gap-4">
      {videos.map((v, i) => (
        <Tile key={v.id} video={v} index={i} />
      ))}
    </div>
  )
}
