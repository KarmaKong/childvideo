/**
 * 首页「选世界」用的巨型分类块：大色块 + 大 emoji + 名字。
 * 深底面板上铺 2 列（宽屏 3 列），先选世界再进具体网格。
 */
export default function WorldBlock({
  icon,
  label,
  color,
  onClick,
}: {
  icon: string
  label: string
  /** 十六进制色值，或传 'rainbow' 用彩虹渐变（给「全部」用） */
  color: string
  onClick: () => void
}) {
  const isRainbow = color === 'rainbow'

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="press flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-blob text-center shadow-toy active:shadow-toysm"
      style={{
        background: isRainbow
          ? 'linear-gradient(135deg,#FF7A59,#FFC23C,#4BC673,#3FB9E8,#9B7BF0,#FF7FB0)'
          : color,
      }}
    >
      <span className="text-5xl leading-none drop-shadow-sm sm:text-6xl">{icon}</span>
      <span className="max-w-[92%] truncate text-lg font-black text-white drop-shadow-sm sm:text-xl">
        {label}
      </span>
    </button>
  )
}
