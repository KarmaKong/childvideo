/**
 * 首页固定分类学（一级 taxonomy）——不是实际文件夹名。
 * 真实 Jellyfin 分类 / 系列（Super Simple Songs、Numberblocks、Yakka Dee…）
 * 按关键词归入这几个桶，首页只展示桶。
 */
import type { Catalog, Video } from '../types'

export interface Tax {
  key: string
  label: string
  emoji: string
  re: RegExp
}

export const TAXONOMY: Tax[] = [
  { key: 'songs', label: '儿歌', emoji: '🎵', re: /nursery|儿歌|song|rhyme|simple\s*song|kidsong|童谣/i },
  { key: 'cartoon', label: '动画', emoji: '🎬', re: /cartoon|动画|anim|kitt|paw|blaze|pocoyo|超级宝贝|bluey/i },
  { key: 'english', label: '英语', emoji: '📘', re: /english|英语|\babc\b|phonics|yakka\s*dee|dee|spelling/i },
  { key: 'science', label: '科普', emoji: '🧪', re: /science|科普|number|math|numberblock|blippi|how\s|自然|实验/i },
  { key: 'story', label: '故事', emoji: '📖', re: /story|故事|tale|fairy|绘本|book/i },
  { key: 'puzzle', label: '益智', emoji: '🧩', re: /puzzle|益智|logic|brain|智力|逻辑/i },
  { key: 'music', label: '音乐', emoji: '🎼', re: /\bmusic\b|音乐|piano|instrument|乐器/i },
]

/** 给视频归一个 taxonomy key（用它的分类名 + 标题匹配）；无匹配返回 null */
export function taxKeyOf(catName: string, title = ''): string | null {
  const hay = `${catName} ${title}`
  for (const t of TAXONOMY) if (t.re.test(hay)) return t.key
  return null
}

/** 某 taxonomy 下的全部可见视频 */
export function videosInTax(catalog: Catalog, key: string, pool: Video[]): Video[] {
  const nameById = new Map(catalog.categories.map((c) => [c.id, c.name]))
  const t = TAXONOMY.find((x) => x.key === key)
  if (!t) return []
  return pool.filter((v) => t.re.test(`${nameById.get(v.category) ?? v.category} ${v.title}`))
}
