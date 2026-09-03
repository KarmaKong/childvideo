import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
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
      <header className="sticky top-0 z-20 flex items-center gap-2 bg-cream/85 px-4 py-3 backdrop-blur">
        <Link
          to="/"
          className="press flex shrink-0 items-center gap-2 whitespace-nowrap text-2xl font-black tracking-tight"
        >
          <span className="text-3xl">🐻</span>
          <span>{appName()}</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {dailyLimitMin > 0 && Number.isFinite(remaining) && (
            <span className="whitespace-nowrap rounded-pill bg-white px-3 py-1.5 text-xs font-extrabold tabular-nums text-candy-coral shadow-toysm sm:text-sm">
              还能看 {Math.ceil(remaining)} 分钟
            </span>
          )}
          <button
            aria-label="家长"
            className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70 text-ink/45 shadow"
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
