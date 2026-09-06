import type { ReactNode } from 'react'
import { BottomNavigation, SideNavigation } from './nav'

/**
 * 应用外壳：桌面左侧导航栏 + 内容列；移动/平板底部导航。
 * 内容列最大宽 1024（阅读舒适），整体页面最大 1440。
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-lumo-cream">
      <div className="mx-auto flex w-full max-w-[1440px]">
        <SideNavigation />
        <main className="w-full max-w-[1024px] flex-1 pb-28 lg:mx-auto lg:pb-12">{children}</main>
      </div>
      <BottomNavigation />
    </div>
  )
}
