import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LumoMascot from './lumo/Mascot'
import { IconButton } from './lumo/Button'
import { Modal } from './lumo/Feedback'
import { SearchBar } from './lumo/primitives'
import { SearchIcon, ClockIcon, HeartFill } from './icons'
import ParentalGate from './ParentalGate'

/** 首页顶栏：mascot + 问候；右侧 搜索 / 观看记录 / 家长中心 */
export default function TopBar({ name = '宝贝' }: { name?: string }) {
  const nav = useNavigate()
  const [gate, setGate] = useState(false)
  const [search, setSearch] = useState<string | null>(null)

  return (
    <>
      <header className="flex items-center justify-between gap-3 px-4 pt:px-6 ipad:px-8 nav:px-8 pt-[max(18px,env(safe-area-inset-top))] nav:min-h-[84px] nav:pt-0">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <LumoMascot pose="wave" size={48} className="shrink-0 nav:hidden" />
          <div className="min-w-0">
            <h1 className="truncate text-title-2 text-lumo-ink pt:text-title-1">Hi, {name}! 👋</h1>
            <p className="mt-0.5 truncate text-body2 text-lumo-ink/50 pt:text-body">
              今天想看什么？
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <IconButton label="搜索" onClick={() => setSearch('')}>
            <SearchIcon className="h-5 w-5" />
          </IconButton>
          <IconButton label="观看记录" onClick={() => nav('/me')}>
            <ClockIcon className="h-5 w-5" />
          </IconButton>

          {/* 竖屏：紧凑图标按钮 */}
          <IconButton
            label="家长中心"
            className="nav:hidden !bg-lumo-yellow/90 !text-lumo-ink"
            onClick={() => setGate(true)}
          >
            <HeartFill className="h-5 w-5 text-lumo-coral" />
          </IconButton>
          {/* 横屏：黄色胶囊 */}
          <button
            onClick={() => setGate(true)}
            className="press hidden h-12 shrink-0 items-center gap-1.5 rounded-pill bg-lumo-yellow px-4 text-body2 font-bold text-lumo-ink shadow-sm nav:flex"
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
