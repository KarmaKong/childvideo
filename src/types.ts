export interface Video {
  id: string
  title: string
  /** 分类 id，对应 Category.id */
  category: string
  /** 视频直链或 HLS 播放列表，相对 CDN_BASE 或 http(s) 绝对地址 */
  src: string
  /** 'mp4' | 'hls'，缺省按后缀推断 */
  kind?: 'mp4' | 'hls'
  /** 封面图，相对 CDN_BASE 或绝对地址；缺省用生成的色块 */
  poster?: string
  /** 秒 */
  duration?: number
  /** 同一系列 + 序号可实现「自动下一集」 */
  series?: string
  episode?: number
  /** 建议年龄下限，用于家长按年龄过滤 */
  minAge?: number
}

export interface Category {
  id: string
  name: string
  /** emoji 或图标字符 */
  icon: string
  color: string
}

export interface Catalog {
  version: number
  categories: Category[]
  videos: Video[]
}
