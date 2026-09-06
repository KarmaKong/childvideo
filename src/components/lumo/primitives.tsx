import type { ReactNode } from 'react'
import { ChevRight, SearchIcon } from '../icons'

/* ---------------- SectionHeader（面板标题行） ---------------- */
export function SectionHeader({
  title,
  icon,
  onMore,
  className = '',
}: {
  title: string
  icon?: ReactNode
  onMore?: () => void
  className?: string
}) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <h2 className="flex items-center gap-1.5 text-title-2 text-lumo-ink">
        {icon}
        {title}
      </h2>
      {onMore && (
        <button
          onClick={onMore}
          aria-label={`更多 ${title}`}
          className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lumo-soft-blue text-lumo-blue"
        >
          <ChevRight className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

/* ---------------- Panel（白色圆角面板） ---------------- */
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-panel bg-white p-4 shadow-sm sm:p-5 ${className}`}>{children}</section>
  )
}

/* ---------------- CategoryTile（热门分类：彩色圆角块 + 文字） ---------------- */
const TINTS: Record<string, string> = {
  coral: '#FF8A3D',
  blue: '#3A7CFF',
  purple: '#A78DFA',
  green: '#48C47D',
  yellow: '#FFC83D',
}
export function CategoryTile({
  label,
  emoji,
  illust,
  tint = 'blue',
  onClick,
}: {
  label: string
  emoji?: string
  illust?: string
  tint?: keyof typeof TINTS | string
  onClick?: () => void
}) {
  const bg = TINTS[tint] ?? tint
  return (
    <button onClick={onClick} className="press flex w-[76px] shrink-0 flex-col items-center gap-2">
      <span
        className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-panel shadow-sm"
        style={{ background: `${bg}1f` }}
      >
        {illust ? (
          <img src={illust} alt="" aria-hidden className="h-[52px] w-[52px] object-contain" />
        ) : (
          <span className="text-3xl">{emoji ?? '🎈'}</span>
        )}
      </span>
      <span className="text-body2 font-semibold text-lumo-ink/80">{label}</span>
    </button>
  )
}

/* ---------------- CategoryChip（分类页 pill） ---------------- */
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
      className={`press flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-pill px-4 text-body2 font-semibold transition-colors ${
        active ? 'bg-lumo-blue text-white' : 'bg-white text-lumo-ink/70 ring-1 ring-black/[0.06]'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

/* ---------------- DurationBadge ---------------- */
export function DurationBadge({ label }: { label: string }) {
  return (
    <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-label font-semibold tabular-nums text-white">
      {label}
    </span>
  )
}

/* ---------------- ProgressBar ---------------- */
export function ProgressBar({
  value,
  tone = 'blue',
  className = '',
}: {
  value: number
  tone?: 'blue' | 'yellow' | 'green'
  className?: string
}) {
  const bg = { blue: 'bg-lumo-blue', yellow: 'bg-lumo-yellow', green: 'bg-lumo-green' }[tone]
  return (
    <span className={`block h-1.5 overflow-hidden rounded-pill bg-black/10 ${className}`}>
      <span
        className={`block h-full rounded-pill ${bg}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </span>
  )
}

/* ---------------- ProfileAvatar ---------------- */
const AVATAR_BG = ['#FFC83D', '#3A7CFF', '#48C47D', '#FF8A3D', '#A78DFA']
export function ProfileAvatar({ name, size = 40 }: { name: string; size?: number }) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  const bg = AVATAR_BG[h % AVATAR_BG.length]
  return (
    <span
      style={{ width: size, height: size, background: bg }}
      className="flex items-center justify-center rounded-full text-card font-extrabold text-white"
    >
      {(name.trim()[0] ?? '★').toUpperCase()}
    </span>
  )
}

/* ---------------- SearchBar ---------------- */
export function SearchBar({
  value,
  onChange,
  placeholder = '搜索你喜欢的内容',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="flex min-h-[48px] items-center gap-2 rounded-pill bg-lumo-soft-blue px-4">
      <SearchIcon className="h-5 w-5 text-lumo-ink/35" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-body text-lumo-ink placeholder:text-lumo-ink/35 outline-none"
      />
    </label>
  )
}
