import type { ReactNode } from 'react'
import { BottomNavigation, SideNavigation } from './nav'

/**
 * 外壳：>900 显示左侧蓝色悬浮导航条；<900 显示底部 Tab Bar。
 * 竖屏与横屏共用组件，布局在断点处切换（非缩放）。
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-lumo-page">
      <div className="mx-auto flex max-w-[1440px]">
        <SideNavigation />
        <main className="min-w-0 flex-1 pb-[calc(72px+env(safe-area-inset-bottom))] nav:pb-10">
          <div className="mx-auto w-full max-w-[1180px]">{children}</div>
        </main>
      </div>
      <BottomNavigation />
    </div>
  )
}
