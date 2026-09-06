import { useCatalog } from '../lib/catalog'
import PageHeader from '../components/PageHeader'
import { VideoGrid, LoadingState, EmptyState } from '../components/lumo'
import { isCategoryAllowed, useSettingsStore } from '../store/useSettingsStore'
import type { Video } from '../types'

const LEARN_KEYS = ['science', '科普', 'english', '英语', 'learn', '学习', 'edu', '益智']

export default function Learn() {
  const { catalog } = useCatalog()
  const settings = useSettingsStore()
  if (!catalog) return <LoadingState />

  const visible = (v: Video) =>
    isCategoryAllowed(settings, v.category) &&
    (settings.maxAge === 0 || (v.minAge ?? 0) <= settings.maxAge)

  const learnCatIds = catalog.categories
    .filter(
      (c) =>
        isCategoryAllowed(settings, c.id) &&
        LEARN_KEYS.some((k) => (c.id + c.name).toLowerCase().includes(k)),
    )
    .map((c) => c.id)

  const vids = catalog.videos.filter((v) => visible(v) && learnCatIds.includes(v.category))

  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeader title="学点新东西" subtitle="科普 · 益智 · 英语" pose="idle" />
      <div className="px-4 pt:px-6 ipad:px-8">
        {vids.length > 0 ? (
          <VideoGrid videos={vids} />
        ) : (
          <EmptyState pose="box" title="还没有学习类视频" hint="家长把科普 / 英语的视频加进片库就会出现在这里" />
        )}
      </div>
    </div>
  )
}
