import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LumoMascot from './lumo/Mascot'
import { IconButton } from './lumo/Button'
import { Modal } from './lumo/Feedback'
import { SearchBar } from './lumo/primitives'
import { Lock, SearchIcon, ClockIcon } from './icons'
import ParentalGate from './ParentalGate'
import { useSettingsStore } from '../store/useSettingsStore'
import { useProgressStore } from '../store/useProgressStore'

/** Home 顶栏：问候 + 小猫；右侧 搜索 / 剩余时长 / 家长锁 */
export default function TopBar({ name = 'Mia' }: { name?: string }) {
  const nav = useNavigate()
  const [gate, setGate] = useState(false)
  const [search, setSearch] = useState<string | null>(null)

  const dailyLimitMin = useSettingsStore((s) => s.dailyLimitMin)
  const remaining = useProgressStore((s) => s.remainingMinutes(dailyLimitMin))
  const showTime = dailyLimitMin > 0 && Number.isFinite(remaining)

  return (
    <>
      <header className="flex items-center gap-3 px-5 pt-5">
        <LumoMascot pose="wave" size={52} />
        <div className="min-w-0">
          <p className="truncate text-section text-lumo-cocoa">Hi, {name} 👋</p>
          <p className="truncate text-body font-semibold text-lumo-cocoa/50">今天想看什么？</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {showTime && (
            <span className="hidden items-center gap-1 rounded-pill bg-lumo-mint/25 px-3 py-2 text-caption font-extrabold tabular-nums text-lumo-cocoa/80 sm:flex">
              <ClockIcon className="h-4 w-4" />
              {Math.ceil(remaining)} 分钟
            </span>
          )}
          <IconButton label="搜索" onClick={() => setSearch('')}>
            <SearchIcon className="h-5 w-5" />
          </IconButton>
          <IconButton label="家长中心" onClick={() => setGate(true)}>
            <Lock className="h-5 w-5" />
          </IconButton>
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
        <p className="mb-3 text-section text-lumo-cocoa">搜索</p>
        <SearchBar value={search ?? ''} onChange={setSearch} />
        <p className="mt-3 text-caption font-semibold text-lumo-cocoa/45">
          输入名字找视频（搜索结果页稍后接上）
        </p>
      </Modal>
    </>
  )
}
