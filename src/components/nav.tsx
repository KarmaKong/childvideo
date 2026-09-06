import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Home, DiscoverIcon, VipIcon, MeIcon, SearchIcon } from './icons'
import LumoLogo from './lumo/Logo'

interface Item {
  to: string
  label: string
  icon: (p: { className?: string }) => ReactNode
}
const ITEMS: Item[] = [
  { to: '/', label: '推荐', icon: (p) => <Home {...p} /> },
  { to: '/discover', label: '发现', icon: (p) => <DiscoverIcon {...p} /> },
  { to: '/vip', label: '会员', icon: (p) => <VipIcon {...p} /> },
  { to: '/me', label: '我的', icon: (p) => <MeIcon {...p} /> },
]

/* -------- 底部 Tab Bar（移动 / 平板） -------- */
export function BottomNavigation() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.05] bg-white/95 px-3 pb-[max(6px,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden"
      aria-label="主导航"
    >
      <ul className="mx-auto flex max-w-md items-center justify-around">
        {ITEMS.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.to === '/'}
              className="flex min-h-[52px] w-[64px] flex-col items-center justify-center gap-1"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-9 w-14 items-center justify-center rounded-pill transition-colors ${
                      isActive ? 'bg-lumo-soft-blue text-lumo-blue' : 'text-lumo-ink/35'
                    }`}
                  >
                    {it.icon({ className: 'h-[22px] w-[22px]' })}
                  </span>
                  <span
                    className={`text-label ${isActive ? 'text-lumo-blue' : 'text-lumo-ink/40'}`}
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

/* -------- 蓝色悬浮导航条（桌面） -------- */
export function SideNavigation() {
  return (
    <div className="sticky top-0 hidden h-screen shrink-0 items-stretch py-5 pl-4 lg:flex">
      <nav
        aria-label="主导航"
        className="flex w-[76px] flex-col items-center gap-2 rounded-hero bg-lumo-blue py-5 shadow-floating"
      >
        <span className="mb-2 flex items-center justify-center">
          <LumoLogo size={44} showWordmark={false} />
        </span>
        <NavLink
          to="/search"
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white/70 transition-colors hover:bg-white/10"
          aria-label="搜索"
        >
          <SearchIcon className="h-[22px] w-[22px]" />
        </NavLink>
        <span className="my-1 h-px w-8 bg-white/15" />
        {ITEMS.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === '/'}
            className="group relative flex h-12 w-12 items-center justify-center"
          >
            {({ isActive }) => (
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${
                  isActive
                    ? 'bg-white text-lumo-blue shadow-sm'
                    : 'text-white/75 group-hover:bg-white/10'
                }`}
              >
                {it.icon({ className: 'h-6 w-6' })}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
