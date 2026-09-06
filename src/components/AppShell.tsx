import type { ReactNode } from 'react'
import { BottomNavigation, SideNavigation } from './nav'

/**
 * 外壳：桌面左侧蓝色悬浮导航条 + 内容列；移动/平板底部 Tab Bar。
 * 页面最大 1440，内容列最大 1120。
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-lumo-page">
      <div className="mx-auto flex w-full max-w-[1440px] justify-center gap-4">
        <SideNavigation />
        <main className="w-full max-w-[1120px] flex-1 pb-28 lg:pb-10">{children}</main>
      </div>
      <BottomNavigation />
    </div>
  )
}
