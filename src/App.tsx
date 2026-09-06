import { useState } from 'react'
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import { appName } from './config'
import ParentalGate from './components/ParentalGate'
import { Parent } from './components/icons'
import { useSettingsStore } from './store/useSettingsStore'
import { useProgressStore } from './store/useProgressStore'

export default function App() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [gate, setGate] = useState(false)

  const dailyLimitMin = useSettingsStore((s) => s.dailyLimitMin)
  const remaining = useProgressStore((s) => s.remainingMinutes(dailyLimitMin))

  const isPlayer = pathname.startsWith('/watch/')
  if (isPlayer) return <Outlet />

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-white/5 bg-lumo-ground/90 px-4 py-3 backdrop-blur">
        <Link to="/" className="press flex shrink-0 items-center gap-2.5 whitespace-nowrap">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-[12px] bg-lumo-amber shadow-glow">
            <img
              src={`${import.meta.env.BASE_URL}lumo-mark.png`}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.parentElement!.textContent = '🐱'
              }}
            />
          </span>
          <span className="text-[22px] font-black tracking-tight text-white">{appName()}</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {dailyLimitMin > 0 && Number.isFinite(remaining) && (
            <span className="whitespace-nowrap rounded-pill bg-lumo-amber px-3 py-1.5 text-xs font-black tabular-nums text-lumo-night shadow-toysm sm:text-sm">
              还能看 {Math.ceil(remaining)} 分钟
            </span>
          )}
          <button
            aria-label="家长"
            className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/55"
            onClick={() => setGate(true)}
          >
            <Parent className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-10">
        <Outlet />
      </main>

      {gate && (
        <ParentalGate
          onPass={() => {
            setGate(false)
            nav('/parent')
          }}
          onCancel={() => setGate(false)}
        />
      )}
    </div>
  )
}
