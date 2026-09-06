import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { HomeLine, Home, CartoonIcon, LearnIcon, HeartIcon, HeartFill, MeIcon } from './icons'
import LumoLogo from './lumo/Logo'

interface Item {
  to: string
  label: string
  icon: (p: { className?: string }, active: boolean) => ReactNode
}
// 儿童主导航只有 5 项；家长中心不在这里（固定在右上角）
const ITEMS: Item[] = [
  { to: '/', label: '首页', icon: (p, a) => (a ? <Home {...p} /> : <HomeLine {...p} />) },
  { to: '/discover', label: '动画', icon: (p) => <CartoonIcon {...p} /> },
  { to: '/learn', label: '学习', icon: (p) => <LearnIcon {...p} /> },
  { to: '/c/fav', label: '收藏', icon: (p, a) => (a ? <HeartFill {...p} /> : <HeartIcon {...p} />) },
  { to: '/me', label: '我的', icon: (p) => <MeIcon {...p} /> },
]

/* -------- 底部 Tab Bar（<900：手机 / 平板竖屏） -------- */
export function BottomNavigation() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.05] bg-white/95 px-1 pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur nav:hidden"
      aria-label="主导航"
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-around">
        {ITEMS.map((it) => (
          <li key={it.to} className="flex-1">
            <NavLink
              to={it.to}
              end={it.to === '/'}
              className="mx-auto flex min-h-[54px] max-w-[76px] flex-col items-center justify-center gap-1"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-12 items-center justify-center rounded-pill transition-colors ${
                      isActive ? 'bg-lumo-soft-blue text-lumo-blue' : 'text-lumo-ink/35'
                    }`}
                  >
                    {it.icon({ className: 'h-[21px] w-[21px]' }, isActive)}
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

/* -------- 蓝色悬浮导航条（>900：横屏 / 桌面） -------- */
export function SideNavigation() {
  return (
    <div className="hidden shrink-0 py-4 pl-3 nav:block">
      <nav
        aria-label="主导航"
        className="sticky top-4 flex w-[72px] flex-col items-center gap-2 rounded-hero bg-lumo-blue py-4 shadow-floating"
      >
        <NavLink to="/" aria-label="LUMO Box 首页" className="mb-1">
          <LumoLogo size={42} showWordmark={false} />
        </NavLink>
        <span className="h-px w-7 bg-white/15" />
        {ITEMS.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.to === '/'} aria-label={it.label}>
            {({ isActive }) => (
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${
                  isActive ? 'bg-white text-lumo-blue shadow-sm' : 'text-white/75 hover:bg-white/10'
                }`}
              >
                {it.icon({ className: 'h-[22px] w-[22px]' }, isActive)}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
