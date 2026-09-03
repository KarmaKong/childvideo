// 运行时配置：启动时 fetch `${BASE_URL}config.json`，覆盖 import.meta.env 的默认值。
// 好处：dist/ 构建一次即可，部署时只改 config.json，不用重新打包。
// 没有 config.json（404 / 空）时，完全回退到 .env（老行为不变）。

export interface RuntimeConfig {
  source?: 'static' | 'jellyfin'
  appName?: string
  cdnBase?: string
  catalogPath?: string
  jellyfin?: {
    base?: string
    key?: string
    userId?: string
    libraryId?: string
    categoryMode?: 'genre' | 'collection' | 'folder'
    stream?: 'direct' | 'hls'
  }
}

let rc: RuntimeConfig = {}

export async function initRuntimeConfig(): Promise<void> {
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}config.json`, { cache: 'no-cache' })
    if (r.ok) {
      const json = (await r.json()) as RuntimeConfig
      if (json && typeof json === 'object') rc = json
    }
  } catch {
    /* 没有就用 .env */
  }
}

export function runtimeConfig(): RuntimeConfig {
  return rc
}
