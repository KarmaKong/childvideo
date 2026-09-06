import type { ReactNode } from 'react'
import { ChevRight, SearchIcon } from '../icons'

/* ---------------- SectionHeader ---------------- */
export function SectionHeader({
  title,
  icon,
  onMore,
}: {
  title: string
  icon?: ReactNode
  onMore?: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-5">
      <h2 className="flex items-center gap-2 text-section text-lumo-cocoa">
        {icon}
        {title}
      </h2>
      {onMore && (
        <button
          onClick={onMore}
          className="press flex shrink-0 items-center gap-0.5 rounded-pill px-2 py-1 text-caption font-bold text-lumo-blue"
        >
          更多 <ChevRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

/* ---------------- CategoryChip ---------------- */
export function CategoryChip({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon?: ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`press flex min-h-[48px] shrink-0 items-center gap-2 rounded-pill px-5 text-card font-bold
        transition-colors ${
          active
            ? 'bg-lumo-blue text-white shadow-md'
            : 'bg-white text-lumo-cocoa shadow-sm ring-1 ring-black/[0.05]'
        }`}
    >
      {icon}
      {label}
    </button>
  )
}

/* ---------------- DurationBadge ---------------- */
export function DurationBadge({ seconds }: { seconds?: number }) {
  if (!seconds) return null
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return (
    <span className="rounded-pill bg-lumo-cocoa/75 px-2 py-0.5 text-caption font-bold tabular-nums text-white">
      {m}:{String(s).padStart(2, '0')}
    </span>
  )
}

/* ---------------- ProgressBar ---------------- */
export function ProgressBar({
  value,
  tone = 'blue',
  className = '',
}: {
  value: number // 0..100
  tone?: 'blue' | 'yellow' | 'mint'
  className?: string
}) {
  const bg = { blue: 'bg-lumo-blue', yellow: 'bg-lumo-yellow', mint: 'bg-lumo-mint' }[tone]
  return (
    <span className={`block h-2 overflow-hidden rounded-pill bg-black/10 ${className}`}>
      <span
        className={`block h-full rounded-pill ${bg}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </span>
  )
}

/* ---------------- ProfileAvatar ---------------- */
const AVATAR_BG = ['#FFC541', '#2F8CF4', '#84D7BD', '#FF8748', '#DCEFFF']
export function ProfileAvatar({ name, size = 40 }: { name: string; size?: number }) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  const bg = AVATAR_BG[h % AVATAR_BG.length]
  return (
    <span
      style={{ width: size, height: size, background: bg }}
      className="flex items-center justify-center rounded-full text-card-lg font-extrabold text-lumo-cocoa"
    >
      {(name.trim()[0] ?? '★').toUpperCase()}
    </span>
  )
}

/* ---------------- SearchBar ---------------- */
export function SearchBar({
  value,
  onChange,
  placeholder = '找一找想看的…',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="flex min-h-[48px] items-center gap-2 rounded-pill bg-white px-4 shadow-sm ring-1 ring-black/[0.05]">
      <SearchIcon className="h-5 w-5 text-lumo-cocoa/40" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-body font-semibold text-lumo-cocoa placeholder:text-lumo-cocoa/35 outline-none"
      />
    </label>
  )
}
