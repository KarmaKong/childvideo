import type { ReactNode } from 'react'
import LumoMascot from './Mascot'

/* ---------------- LoadingState ---------------- */
export function LoadingState({ text = '小猫正在找视频…' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-16 text-center">
      <LumoMascot pose="box" size={112} />
      <p className="text-card-lg font-bold text-lumo-cocoa/70">{text}</p>
    </div>
  )
}

/* ---------------- EmptyState ---------------- */
export function EmptyState({
  pose = 'peek',
  title,
  hint,
  action,
}: {
  pose?: 'peek' | 'sleep' | 'box' | 'happy'
  title: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
      <LumoMascot pose={pose} size={120} />
      <p className="text-section text-lumo-cocoa">{title}</p>
      {hint && <p className="max-w-xs text-body font-semibold text-lumo-cocoa/50">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/* ---------------- Modal ---------------- */
export function Modal({
  open,
  onClose,
  children,
  labelledBy,
}: {
  open: boolean
  onClose?: () => void
  children: ReactNode
  labelledBy?: string
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-lumo-cocoa/45 p-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div
        className="w-full max-w-sm rounded-panel bg-lumo-paper p-6 shadow-floating"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
