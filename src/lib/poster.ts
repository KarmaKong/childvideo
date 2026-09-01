// 没有封面图时，用标题生成一个稳定的彩色 SVG 占位图（data URI，无外部请求）。
const PALETTE = ['#ff7a59', '#4dabf7', '#51cf66', '#9775fa', '#ffd43b', '#ff8787', '#38d9a9']

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

export function placeholderPoster(title: string): string {
  const h = hash(title)
  const c1 = PALETTE[h % PALETTE.length]
  const c2 = PALETTE[(h >> 3) % PALETTE.length]
  const initial = (title.trim()[0] ?? '★').toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect width="480" height="270" fill="url(#g)"/>
    <text x="50%" y="54%" font-size="120" font-family="PingFang SC, sans-serif"
      fill="rgba(255,255,255,0.92)" text-anchor="middle" dominant-baseline="middle">${initial}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
