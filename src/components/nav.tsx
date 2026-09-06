import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Home, CartoonIcon, LearnIcon, MeIcon } from './icons'
import LumoLogo from './lumo/Logo'

interface Item {
  to: string
  label: string
  icon: (p: { className?: string }) => ReactNode
}
const ITEMS: Item[] = [
  { to: '/', label: '首页', icon: (p) => <Home {...p} /> },
  { to: '/discover', label: '动画', icon: (p) => <CartoonIcon {...p} /> },
  { to: '/learn', label: '学习', icon: (p) => <LearnIcon {...p} /> },
  { to: '/me', label: '我的', icon: (p) => <MeIcon {...p} /> },
]

/* -------- BottomNavigation (mobile / tablet) -------- */
export function BottomNavigation() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.04] bg-lumo-cream/95 px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden"
      aria-label="主导航"
    >
      <ul className="mx-auto flex max-w-md items-center justify-around">
        {ITEMS.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.to === '/'}
              className="flex min-h-[56px] w-[68px] flex-col items-center justify-center gap-1"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-10 w-14 items-center justify-center rounded-pill transition-colors ${
                      isActive ? 'bg-lumo-soft-blue text-lumo-blue' : 'text-lumo-cocoa/45'
                    }`}
                  >
                    {it.icon({ className: 'h-6 w-6' })}
                  </span>
                  <span
                    className={`text-[13px] font-bold ${
                      isActive ? 'text-lumo-blue' : 'text-lumo-cocoa/45'
                    }`}
                  >
                    {it.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* -------- SideNavigation (desktop rail) -------- */
export function SideNavigation() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col gap-2 border-r border-black/[0.04] bg-lumo-cream px-4 py-6 lg:flex">
      <div className="mb-4 px-2">
        <LumoLogo size={34} />
      </div>
      <nav aria-label="主导航" className="flex flex-col gap-1.5">
        {ITEMS.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === '/'}
            className={({ isActive }) =>
              `flex min-h-[52px] items-center gap-3 rounded-pill px-4 text-card font-bold transition-colors ${
                isActive
                  ? 'bg-lumo-soft-blue text-lumo-blue'
                  : 'text-lumo-cocoa/55 hover:bg-black/[0.03]'
              }`
            }
          >
            {it.icon({ className: 'h-6 w-6' })}
            {it.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
