import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconButton } from './lumo/Button'
import { Modal } from './lumo/Feedback'
import { SearchBar } from './lumo/primitives'
import { SearchIcon, ClockIcon, HeartFill } from './icons'
import ParentalGate from './ParentalGate'

/** 首页顶栏：问候 + 右侧 搜索 / 历史 / 家长中心（黄胶囊） */
export default function TopBar({ name = '宝贝' }: { name?: string }) {
  const nav = useNavigate()
  const [gate, setGate] = useState(false)
  const [search, setSearch] = useState<string | null>(null)

  return (
    <>
      <header className="flex items-center gap-3 px-4 pt-5 sm:px-5">
        <div className="min-w-0 flex-1">
          <h1 className="text-title-2 text-lumo-ink sm:text-title-1">Hi, {name}! 👋</h1>
          <p className="mt-0.5 truncate text-body2 text-lumo-ink/50 sm:text-body">
            一起探索有趣的视频世界吧！
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <IconButton label="搜索" onClick={() => setSearch('')}>
            <SearchIcon className="h-5 w-5" />
          </IconButton>
          <IconButton label="观看历史" className="hidden sm:flex" onClick={() => nav('/me')}>
            <ClockIcon className="h-5 w-5" />
          </IconButton>
          <button
            onClick={() => setGate(true)}
            aria-label="家长中心"
            className="press flex h-12 items-center gap-1.5 rounded-pill bg-lumo-yellow px-3.5 text-body2 font-bold text-lumo-ink shadow-sm sm:px-4"
          >
            <HeartFill className="h-4 w-4 text-lumo-coral" />
            家长中心
          </button>
        </div>
      </header>

      {gate && (
        <ParentalGate
          onPass={() => {
            setGate(false)
            nav('/parent')
          }}
          onCancel={() => setGate(false)}
        />
      )}

      <Modal open={search !== null} onClose={() => setSearch(null)}>
        <p className="mb-3 text-title-2 text-lumo-ink">搜索</p>
        <SearchBar value={search ?? ''} onChange={setSearch} />
        <p className="mt-3 text-caption text-lumo-ink/45">输入名字找视频（结果页稍后接上）</p>
      </Modal>
    </>
  )
}
