import type { ReactNode } from 'react'
import LumoMascot from './lumo/Mascot'

/** 非首页的简单页头：小猫 + 标题（+ 右侧插槽） */
export default function PageHeader({
  title,
  subtitle,
  pose = 'idle',
  right,
}: {
  title: string
  subtitle?: string
  pose?: 'idle' | 'happy' | 'peek' | 'wave'
  right?: ReactNode
}) {
  return (
    <header className="flex items-center gap-3 px-4 pt-5 pt:px-6 ipad:px-8">
      <LumoMascot pose={pose} size={48} />
      <div className="min-w-0">
        <h1 className="truncate text-page-title font-extrabold text-lumo-cocoa">{title}</h1>
        {subtitle && (
          <p className="truncate text-body font-semibold text-lumo-cocoa/50">{subtitle}</p>
        )}
      </div>
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </header>
  )
}
