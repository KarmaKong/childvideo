export default function CategoryBubble({
  icon,
  label,
  color,
  active,
  onClick,
}: {
  icon: string
  label: string
  color: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="press flex shrink-0 flex-col items-center gap-1.5"
      aria-pressed={active}
    >
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full text-3xl shadow-toysm transition-all sm:h-20 sm:w-20 sm:text-4xl"
        style={{
          background: active ? color : '#fff',
          outline: active ? `4px solid ${color}55` : '4px solid transparent',
          outlineOffset: 2,
        }}
      >
        {icon}
      </span>
      <span
        className="max-w-[76px] truncate text-[13px] font-extrabold"
        style={{ color: active ? color : '#3A2E28AA' }}
      >
        {label}
      </span>
    </button>
  )
}
