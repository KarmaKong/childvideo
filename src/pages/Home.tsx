import { useNavigate } from 'react-router-dom'
import { useCatalog } from '../lib/catalog'
import { sourceMode } from '../lib/source'
import TopBar from '../components/TopBar'
import {
  SectionHeader,
  CategoryTile,
  VideoRow,
  ContinueWatchingHero,
  LoadingState,
  EmptyState,
} from '../components/lumo'
import { SparkIcon, ClockIcon } from '../components/icons'
import { isCategoryAllowed, useSettingsStore } from '../store/useSettingsStore'
import { useProgressStore } from '../store/useProgressStore'
import type { Video, Category } from '../types'

const B = import.meta.env.BASE_URL
const ILLU = `${B}illust/category/`
const CAT_SVGS = ['cartoons', 'music', 'science', 'stories', 'learn']
const TINT_CYCLE = ['coral', 'blue', 'purple', 'green', 'yellow', 'purple', 'coral']

// 固定的内容分区（横竖屏共用同一套 IA）
const NAMED = [
  { key: 'cartoons', title: '动画', icon: '🎬', re: /cartoon|动画|anim/i },
  { key: 'music', title: '儿歌', icon: '🎵', re: /nursery|music|儿歌|song|音乐/i },
  { key: 'english', title: '英语', icon: '📘', re: /english|英语|\babc\b/i },
  { key: 'science', title: '科普 · 学习', icon: '🧪', re: /science|科普|number|math|learn|学习|益智|edu/i },
] as const

function catSvg(idName: string, i: number): string {
  const k = idName.toLowerCase()
  let name = CAT_SVGS[i % CAT_SVGS.length]
  if (/cartoon|动画|anim/.test(k)) name = 'cartoons'
  else if (/nursery|music|儿歌|song|音乐/.test(k)) name = 'music'
  else if (/science|科普|number|math/.test(k)) name = 'science'
  else if (/story|故事|tale/.test(k)) name = 'stories'
  else if (/english|英语|learn|学习|益智|edu|abc/.test(k)) name = 'learn'
  return `${ILLU}category-${name}.svg`
}

export default function Home() {
  const nav = useNavigate()
  const { catalog, error } = useCatalog()
  const settings = useSettingsStore()
  const history = useProgressStore((s) => s.history)
  const progress = useProgressStore((s) => s.progress)

  if (error)
    return (
      <EmptyState
        pose="peek"
        title="片库没连上"
        hint={
          sourceMode() === 'jellyfin'
            ? '检查 config.json 的 jellyfin 配置，以及 Jellyfin 是否可访问'
            : '检查 VITE_CDN_BASE 或 catalog.json 是否可访问'
        }
      />
    )
  if (!catalog) return <LoadingState />

  const visible = (v: Video) =>
    isCategoryAllowed(settings, v.category) &&
    (settings.maxAge === 0 || (v.minAge ?? 0) <= settings.maxAge)

  const all = catalog.videos.filter(visible)
  const byId = new Map(catalog.videos.map((v) => [v.id, v]))
  const recent = history.map((id) => byId.get(id)).filter((v): v is Video => !!v && visible(v))

  const inProgress = recent.filter((v) => {
    const e = progress[v.id]
    return e && e.position > 5 && e.duration > 0 && e.position < e.duration - 10
  })
  const hero = inProgress[0]
  const recommend = [
    ...inProgress.filter((v) => v.id !== hero?.id),
    ...all.filter((v) => v.id !== hero?.id),
  ]
    .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
    .slice(0, 12)

  const cats = catalog.categories.filter(
    (c) => isCategoryAllowed(settings, c.id) && all.some((v) => v.category === c.id),
  )
  const vidsOf = (c: Category) => all.filter((v) => v.category === c.id)

  // 命名分区 + 未归类分区
  const used = new Set<string>()
  const namedSections = NAMED.map((n) => {
    const match = cats.filter((c) => n.re.test(`${c.id} ${c.name}`))
    match.forEach((c) => used.add(c.id))
    const vids = match.flatMap(vidsOf)
    return { ...n, vids, only: match.length === 1 ? match[0] : null }
  }).filter((s) => s.vids.length > 0)
  const leftover = cats.filter((c) => !used.has(c.id))

  if (all.length === 0)
    return (
      <>
        <TopBar />
        <div className="px-4 pt:px-6 ipad:px-8">
          <EmptyState pose="box" title="片库还是空的" hint="家长在片库里加几个视频就好啦" />
        </div>
      </>
    )

  return (
    <div className="flex flex-col gap-6 pb-6 nav:gap-8">
      <TopBar />

      <div className="flex flex-col gap-6 px-4 pt:px-6 ipad:px-8 nav:gap-8">
        {/* 1. Continue Watching */}
        {hero && <ContinueWatchingHero video={hero} />}

        {/* 2. Recommended */}
        <section>
          <SectionHeader
            title="为你推荐"
            icon={<SparkIcon className="h-5 w-5 text-lumo-yellow" />}
            onMore={() => nav('/discover')}
            className="mb-3"
          />
          <VideoRow videos={recommend} />
        </section>

        {/* 3. Popular Categories —— 水平单行 */}
        {cats.length > 0 && (
          <section>
            <SectionHeader
              title="热门分类"
              icon={<SparkIcon className="h-5 w-5 text-lumo-yellow" />}
              className="mb-3"
            />
            <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <CategoryTile label="全部" emoji="🗂️" tint="blue" onClick={() => nav('/discover')} />
              {cats.map((c, i) => (
                <CategoryTile
                  key={c.id}
                  label={c.name}
                  illust={catSvg(`${c.id} ${c.name}`, i)}
                  tint={TINT_CYCLE[i % TINT_CYCLE.length]}
                  onClick={() => nav(`/c/${c.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 4–7. 命名内容分区 */}
        {namedSections.map((s) => (
          <section key={s.key}>
            <SectionHeader
              title={s.title}
              icon={<span className="text-xl leading-none">{s.icon}</span>}
              onMore={() => nav(s.only ? `/c/${s.only.id}` : '/discover')}
              className="mb-3"
            />
            <VideoRow videos={s.vids} />
          </section>
        ))}

        {/* 未归类的其它分类，各自独立分区 */}
        {leftover.map((c) => (
          <section key={c.id}>
            <SectionHeader
              title={c.name}
              icon={<span className="text-xl leading-none">{c.icon}</span>}
              onMore={() => nav(`/c/${c.id}`)}
              className="mb-3"
            />
            <VideoRow videos={vidsOf(c)} />
          </section>
        ))}

        {/* 8. Recently Watched */}
        {recent.length > 0 && (
          <section>
            <SectionHeader
              title="最近看过"
              icon={<ClockIcon className="h-5 w-5 text-lumo-blue" />}
              onMore={() => nav('/me')}
              className="mb-3"
            />
            <VideoRow videos={recent} />
          </section>
        )}
      </div>
    </div>
  )
}
