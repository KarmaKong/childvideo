import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { appName } from './config'
import ParentalGate from './components/ParentalGate'
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
      <header className="sticky top-0 z-20 flex items-center gap-2 bg-kid-bg/90 px-3 py-3 backdrop-blur">
        <Link to="/" className="flex shrink-0 items-center gap-1.5 text-lg font-extrabold whitespace-nowrap">
          <span className="text-2xl">🎬</span>
          {appName()}
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {dailyLimitMin > 0 && Number.isFinite(remaining) && (
            <span className="whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-xs font-bold text-kid-primary shadow sm:text-sm">
              还可看 {Math.ceil(remaining)} 分钟
            </span>
          )}
          <button
            className="shrink-0 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-sm font-bold shadow active:scale-95"
            onClick={() => setGate(true)}
          >
            👨‍👩‍👧 家长
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
