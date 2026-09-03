// 粗线条圆头图标，替代 emoji，风格统一
import type { SVGProps } from 'react'

const base = (p: SVGProps<SVGSVGElement>) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...p,
})

export const Play = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M7 4.5v15l13-7.5z" fill="currentColor" stroke="none" />
  </svg>
)
export const Pause = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="5.5" y="4" width="4.5" height="16" rx="1.6" fill="currentColor" stroke="none" />
    <rect x="14" y="4" width="4.5" height="16" rx="1.6" fill="currentColor" stroke="none" />
  </svg>
)
export const Back10 = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M11 8H5.5M5.5 8l4-4M5.5 8l4 4" />
    <path d="M6 13a7 7 0 1 0 3-6.5" />
  </svg>
)
export const Fwd10 = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M13 8h5.5M18.5 8l-4-4M18.5 8l-4 4" />
    <path d="M18 13A7 7 0 1 1 15 6.5" />
  </svg>
)
export const ChevLeft = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
)
export const Lock = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="3" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </svg>
)
export const Expand = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </svg>
)
export const Star = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path
      d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
)
export const StarLine = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9z" />
  </svg>
)
export const Replay = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 12a8 8 0 1 0 2.3-5.6" />
    <path d="M6 3v4h4" />
  </svg>
)
export const Home = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 11l8-7 8 7" />
    <path d="M6 10v9h12v-9" />
  </svg>
)
export const Parent = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3" />
    <circle cx="16.5" cy="9" r="2.4" />
    <path d="M4 20c0-3.3 2.2-6 5-6s5 2.7 5 6M14.5 20c0-2.4 1.3-4.5 3.2-5" />
  </svg>
)
