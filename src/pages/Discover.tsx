import { useState } from 'react'
import { useCatalog } from '../lib/catalog'
import PageHeader from '../components/PageHeader'
import { CategoryChip, VideoGrid, LoadingState, EmptyState } from '../components/lumo'
import { isCategoryAllowed, useSettingsStore } from '../store/useSettingsStore'
import type { Video } from '../types'

export default function Discover() {
  const { catalog } = useCatalog()
  const settings = useSettingsStore()
  const [pick, setPick] = useState('all')

  if (!catalog) return <LoadingState />

  const visible = (v: Video) =>
    isCategoryAllowed(settings, v.category) &&
    (settings.maxAge === 0 || (v.minAge ?? 0) <= settings.maxAge)

  const cats = catalog.categories.filter(
    (c) => isCategoryAllowed(settings, c.id) && catalog.videos.some((v) => v.category === c.id),
  )
  const vids = catalog.videos.filter(
    (v) => visible(v) && (pick === 'all' || v.category === pick),
  )

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="看点什么" subtitle="挑一个分类" pose="happy" />

      <div className="flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <CategoryChip label="全部" active={pick === 'all'} onClick={() => setPick('all')} />
        {cats.map((c) => (
          <CategoryChip
            key={c.id}
            label={c.name}
            icon={<span className="text-lg leading-none">{c.icon}</span>}
            active={pick === c.id}
            onClick={() => setPick(c.id)}
          />
        ))}
      </div>

      {vids.length > 0 ? (
        <VideoGrid videos={vids} />
      ) : (
        <EmptyState pose="peek" title="这个分类还没有视频" />
      )}
    </div>
  )
}
