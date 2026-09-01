// 运行期配置。所有资源地址都以 CDN_BASE 为根。
// 未配置 VITE_CDN_BASE 时回退到本地 public/ 目录（开发用示例片库）。

const rawBase = (import.meta.env.VITE_CDN_BASE ?? '').trim().replace(/\/+$/, '')

export const CDN_BASE = rawBase // '' 表示使用同源 /public

export const CATALOG_PATH =
  (import.meta.env.VITE_CATALOG_PATH ?? 'catalog.json').trim().replace(/^\/+/, '')

/** 把 catalog 里的相对路径解析成可加载的绝对地址 */
export function assetUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const clean = path.replace(/^\/+/, '')
  return CDN_BASE ? `${CDN_BASE}/${clean}` : `/${clean}`
}

export const CATALOG_URL = assetUrl(CATALOG_PATH)

export const APP_NAME = '小小影院'
