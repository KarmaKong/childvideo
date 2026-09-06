/**
 * LUMO Cat —— 品牌引导角色。原创内联 SVG，无版权素材。
 * pose: idle | wave | happy | sleep | box | peek
 * 轻微呼吸 + 眨眼（reduced-motion 下自动静止，由全局 CSS 处理）。
 */
type Pose = 'idle' | 'wave' | 'happy' | 'sleep' | 'box' | 'peek'

const YELLOW = '#FFC541'
const DEEP = '#F2A93B'
const COCOA = '#211A16'
const BLUSH = '#FF8748'
const BLUE = '#2F8CF4'

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
  const eyesClosed = pose === 'sleep' || pose === 'happy'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="LUMO 小猫"
    >
      <g
        className={animate ? 'origin-center animate-breathe' : ''}
        style={{ transformBox: 'fill-box' }}
      >
        {/* box / peek 的道具在身体后面 */}
        {pose === 'box' && (
          <g>
            <rect x="30" y="70" width="60" height="34" rx="8" fill={BLUE} />
            <rect x="30" y="70" width="60" height="10" rx="5" fill="#5AA6F7" />
            <path d="M42 70 L60 58 L78 70" fill="none" stroke="#5AA6F7" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}

        {/* ears */}
        <path d="M28 44 L24 20 L46 34 Z" fill={YELLOW} />
        <path d="M92 44 L96 20 L74 34 Z" fill={YELLOW} />
        <path d="M31 40 L29 27 L40 34 Z" fill={DEEP} />
        <path d="M89 40 L91 27 L80 34 Z" fill={DEEP} />

        {/* head */}
        <rect x="24" y="34" width="72" height="60" rx="30" fill={YELLOW} />

        {/* cheeks */}
        <ellipse cx="37" cy="70" rx="7" ry="5" fill={BLUSH} opacity="0.5" />
        <ellipse cx="83" cy="70" rx="7" ry="5" fill={BLUSH} opacity="0.5" />

        {/* eyes */}
        {eyesClosed ? (
          <g stroke={COCOA} strokeWidth="4" strokeLinecap="round" fill="none">
            {pose === 'happy' ? (
              <>
                <path d="M42 60 q6 -8 12 0" />
                <path d="M66 60 q6 -8 12 0" />
              </>
            ) : (
              <>
                <path d="M42 62 q6 6 12 0" />
                <path d="M66 62 q6 6 12 0" />
              </>
            )}
          </g>
        ) : (
          <g fill={COCOA} className={animate ? 'origin-center animate-blink' : ''} style={{ transformBox: 'fill-box' }}>
            <circle cx="48" cy="61" r="5.5" />
            <circle cx="72" cy="61" r="5.5" />
            <circle cx="50" cy="59" r="1.8" fill="#fff" />
            <circle cx="74" cy="59" r="1.8" fill="#fff" />
          </g>
        )}

        {/* nose + mouth */}
        <path d="M57 71 h6 l-3 3 z" fill={BLUSH} />
        <path d="M60 74 q-4 5 -9 3 M60 74 q4 5 9 3" fill="none" stroke={COCOA} strokeWidth="3" strokeLinecap="round" />

        {/* whiskers */}
        <g stroke={COCOA} strokeWidth="2.5" strokeLinecap="round" opacity="0.55">
          <path d="M30 66 h-10 M31 73 h-11" />
          <path d="M90 66 h10 M89 73 h11" />
        </g>

        {/* sleep zzz */}
        {pose === 'sleep' && (
          <g fill={COCOA} fontFamily="Nunito Variable, sans-serif" fontWeight="800">
            <text x="92" y="34" fontSize="12">z</text>
            <text x="100" y="24" fontSize="16">Z</text>
          </g>
        )}

        {/* wave paw */}
        {pose === 'wave' && (
          <g className={animate ? 'origin-bottom animate-wiggle' : ''} style={{ transformBox: 'fill-box' }}>
            <circle cx="99" cy="60" r="9" fill={YELLOW} stroke={DEEP} strokeWidth="2" />
          </g>
        )}
        {/* peek paws over an edge */}
        {pose === 'peek' && (
          <g fill={YELLOW} stroke={DEEP} strokeWidth="2">
            <rect x="34" y="92" width="16" height="12" rx="6" />
            <rect x="70" y="92" width="16" height="12" rx="6" />
          </g>
        )}
      </g>
    </svg>
  )
}
