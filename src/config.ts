// 运行期配置。优先用 runtime config.json，回退到 import.meta.env。
// 这些都是函数（惰性求值）：config.json 在渲染前才 fetch 回来，模块加载时还没有。

import { runtimeConfig } from './runtime-config'

function envStr(v: string | undefined): string {
  return (v ?? '').trim()
}

/** 资源根地址；'' 表示同源 /public */
export function cdnBase(): string {
  const v = envStr(runtimeConfig().cdnBase ?? import.meta.env.VITE_CDN_BASE)
  return v.replace(/\/+$/, '')
}

export function catalogPath(): string {
  const v = envStr(runtimeConfig().catalogPath ?? import.meta.env.VITE_CATALOG_PATH) || 'catalog.json'
  return v.replace(/^\/+/, '')
}

/** 把 catalog 里的相对路径解析成可加载的绝对地址 */
export function assetUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const clean = path.replace(/^\/+/, '')
  const base = cdnBase()
  return base ? `${base}/${clean}` : `/${clean}`
}

export function catalogUrl(): string {
  return assetUrl(catalogPath())
}

export function appName(): string {
  return envStr(runtimeConfig().appName) || '小小影院'
}
