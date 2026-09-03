import { useNavigate, useParams } from 'react-router-dom'
import { useCatalog } from '../lib/catalog'
import Grid from '../components/Grid'
import { isCategoryAllowed, useSettingsStore } from '../store/useSettingsStore'
import { ChevLeft } from '../components/icons'

export default function CategoryPage() {
  const { categoryId = '' } = useParams()
  const nav = useNavigate()
  const { catalog } = useCatalog()
  const settings = useSettingsStore()

  if (!catalog)
    return <p className="p-16 text-center text-lg font-black text-ink/40">加载中…</p>

  const cat = catalog.categories.find((c) => c.id === categoryId)
  const allowed = isCategoryAllowed(settings, categoryId)
  const vids = catalog.videos.filter(
    (v) =>
      v.category === categoryId &&
      (settings.maxAge === 0 || (v.minAge ?? 0) <= settings.maxAge),
  )

  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          onClick={() => nav('/')}
          className="btn-round h-12 w-12"
          aria-label="返回"
        >
          <ChevLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-black">
          {cat?.icon} {cat?.name ?? '分类'}
        </h1>
      </div>

      {!allowed ? (
        <p className="p-16 text-center font-black text-ink/40">这个分类被藏起来啦</p>
      ) : vids.length === 0 ? (
        <p className="p-16 text-center font-black text-ink/40">这里还没有视频</p>
      ) : (
        <Grid videos={vids} />
      )}
    </div>
  )
}
