import { runtimeConfig } from '../../runtime-config'
import type { CatalogSource } from './types'
import { StaticSource } from './static'
import { JellyfinSource } from './jellyfin'

export type { CatalogSource, Playback } from './types'

/** 'static'（默认）或 'jellyfin'，优先 config.json，回退 .env */
export function sourceMode(): 'static' | 'jellyfin' {
  const m = (runtimeConfig().source ?? import.meta.env.VITE_SOURCE ?? 'static').trim()
  return m === 'jellyfin' ? 'jellyfin' : 'static'
}

let instance: CatalogSource | null = null

/** 全局唯一的数据源实例（惰性创建，此时 runtime config 已就绪） */
export function getSource(): CatalogSource {
  if (!instance) {
    instance = sourceMode() === 'jellyfin' ? new JellyfinSource() : new StaticSource()
  }
  return instance
}
