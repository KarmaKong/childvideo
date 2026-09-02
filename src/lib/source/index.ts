import type { CatalogSource } from './types'
import { StaticSource } from './static'
import { JellyfinSource } from './jellyfin'

export type { CatalogSource, Playback } from './types'

const MODE = (import.meta.env.VITE_SOURCE ?? 'static').trim()

let instance: CatalogSource | null = null

/** 全局唯一的数据源实例，按 VITE_SOURCE 选择。 */
export function getSource(): CatalogSource {
  if (!instance) {
    instance = MODE === 'jellyfin' ? new JellyfinSource() : new StaticSource()
  }
  return instance
}

export const SOURCE_MODE = MODE
