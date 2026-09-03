import type { Catalog, Video } from '../../types'

export interface Playback {
  src: string
  kind: 'mp4' | 'hls'
  /** 直连播放失败时的备选地址（一般是让服务端转码的 HLS） */
  fallback?: { src: string; kind: 'mp4' | 'hls' }
}

/**
 * 片库数据源抽象。
 * - StaticSource：读 catalog.json，资源在对象存储 / CDN（默认）
 * - JellyfinSource：查询自建 Jellyfin 的「儿童」媒体库，进度回写服务端多设备同步
 *
 * 通过环境变量 VITE_SOURCE=static|jellyfin 切换，页面代码不感知。
 */
export interface CatalogSource {
  /** 拉取整个精选片库（分类 + 视频列表） */
  loadCatalog(): Promise<Catalog>

  /** 解析某个视频的可播放地址与类型 */
  resolvePlayback(video: Video): Playback

  /** 解析封面图地址；返回 null 时前端用标题生成的占位图 */
  resolvePoster(video: Video): string | null

  /** 服务端记录的续播位置（秒）。没有则返回 null，前端回退到本地进度 */
  getResumePosition?(video: Video): Promise<number | null>

  /** 开始播放上报（建立会话） */
  reportStart?(video: Video, positionSec: number): void
  /** 播放中定时上报（前端已节流到 ~10s 一次） */
  reportProgress?(video: Video, positionSec: number, paused: boolean): void
  /** 停止 / 离开播放页上报 */
  reportStop?(video: Video, positionSec: number): void
}
