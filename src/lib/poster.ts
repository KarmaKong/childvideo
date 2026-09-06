// 没有封面图时，用标题生成一个稳定的彩色 SVG 占位图（data URI，无外部请求）。
// 幼儿向：大色块渐变 + 一个简单友好的形状，不用文字。
// LUMO 双色：钴蓝 / 琥珀 / 青绿 / 紫 / 午夜蓝 / 爆米花红
const PAIRS: [string, string][] = [
  ['#2E6BE6', '#FFC02E'],
  ['#1E3A7A', '#3FA7F0'],
  ['#37B58A', '#FFC02E'],
  ['#7C5CE0', '#2E6BE6'],
  ['#FFC02E', '#E8433B'],
  ['#141A2E', '#2E6BE6'],
]

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

const SHAPES = [
  // circle
  `<circle cx="240" cy="135" r="66" fill="rgba(255,255,255,.9)"/>`,
  // heart
  `<path d="M240 178c-40-26-64-46-64-74a30 30 0 0 1 56-15 30 30 0 0 1 56 15c0 28-24 48-48 74z" fill="rgba(255,255,255,.9)"/>`,
  // star
  `<path d="M240 70l19 40 44 6-32 31 8 44-39-21-39 21 8-44-32-31 44-6z" fill="rgba(255,255,255,.9)"/>`,
  // cloud
  `<path d="M196 158a28 28 0 0 1 4-56 40 40 0 0 1 78-6 26 26 0 0 1 2 62z" fill="rgba(255,255,255,.9)"/>`,
  // rounded square
  `<rect x="188" y="82" width="104" height="104" rx="26" fill="rgba(255,255,255,.9)"/>`,
]

export function placeholderPoster(title: string): string {
  const h = hash(title || 'x')
  const [c1, c2] = PAIRS[h % PAIRS.length]
  const shape = SHAPES[(h >> 4) % SHAPES.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect width="480" height="270" fill="url(#g)"/>
    <g transform="translate(0,-2)">${shape}</g>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
