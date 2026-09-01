import { Link, useParams } from 'react-router-dom'
import { useCatalog } from '../lib/catalog'
import VideoCard from '../components/VideoCard'
import { isCategoryAllowed, useSettingsStore } from '../store/useSettingsStore'

export default function CategoryPage() {
  const { categoryId = '' } = useParams()
  const { catalog } = useCatalog()
  const settings = useSettingsStore()

  if (!catalog) return <p className="p-10 text-center text-gray-400">加载中…</p>

  const cat = catalog.categories.find((c) => c.id === categoryId)
  const allowed = isCategoryAllowed(settings, categoryId)
  const vids = catalog.videos.filter(
    (v) =>
      v.category === categoryId &&
      (settings.maxAge === 0 || (v.minAge ?? 0) <= settings.maxAge),
  )

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <Link to="/" className="btn-ghost !px-3 !py-2 text-base">
          ‹ 返回
        </Link>
        <h1 className="text-2xl font-extrabold">
          {cat?.icon} {cat?.name ?? '分类'}
        </h1>
      </div>

      {!allowed ? (
        <p className="p-10 text-center text-gray-500">该分类已被家长隐藏。</p>
      ) : vids.length === 0 ? (
        <p className="p-10 text-center text-gray-500">这个分类还没有视频。</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {vids.map((v) => (
            <div key={v.id} className="flex justify-center">
              <VideoCard video={v} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
