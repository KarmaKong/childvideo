/**
 * LUMO Cat —— 品牌 3D 角色。直接用提供的 PNG 品牌资产，不用 SVG/CSS 重画。
 * 资产：public/mascot/{idle,happy,sleep,box,wave}.png（1024² 透明底）。
 */
type Pose = 'idle' | 'wave' | 'happy' | 'sleep' | 'box' | 'peek'

const FILE: Record<Pose, string> = {
  idle: 'idle',
  wave: 'wave',
  happy: 'happy',
  sleep: 'sleep',
  box: 'box',
  peek: 'idle',
}

export default function LumoMascot({
  pose = 'idle',
  size = 96,
  className = '',
  animate = true,
}: {
  pose?: Pose
  size?: number
  className?: string
  animate?: boolean
}) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}mascot/${FILE[pose]}.png`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      draggable={false}
      className={`${animate ? 'animate-breathe' : ''} select-none object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
