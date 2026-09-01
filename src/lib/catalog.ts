import { useEffect, useState } from 'react'
import { CATALOG_URL } from '../config'
import type { Catalog, Video } from '../types'

let cache: Catalog | null = null
let inflight: Promise<Catalog> | null = null

export async function loadCatalog(): Promise<Catalog> {
  if (cache) return cache
  if (inflight) return inflight
  inflight = fetch(CATALOG_URL, { cache: 'no-cache' })
    .then((r) => {
      if (!r.ok) throw new Error(`加载片库失败 (${r.status})`)
      return r.json() as Promise<Catalog>
    })
    .then((data) => {
      cache = normalize(data)
      return cache
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

function normalize(data: Catalog): Catalog {
  return {
    ...data,
    videos: data.videos.map((v) => ({
      ...v,
      kind: v.kind ?? (/\.m3u8($|\?)/i.test(v.src) ? 'hls' : 'mp4'),
    })),
  }
}

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(cache)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    loadCatalog()
      .then((c) => alive && setCatalog(c))
      .catch((e) => alive && setError(String(e.message ?? e)))
    return () => {
      alive = false
    }
  }, [])

  return { catalog, error }
}

export function findVideo(catalog: Catalog, id: string): Video | undefined {
  return catalog.videos.find((v) => v.id === id)
}

/** 同系列下一集 */
export function nextInSeries(catalog: Catalog, video: Video): Video | undefined {
  if (!video.series || video.episode == null) return undefined
  return catalog.videos
    .filter((v) => v.series === video.series && (v.episode ?? 0) > (video.episode ?? 0))
    .sort((a, b) => (a.episode ?? 0) - (b.episode ?? 0))[0]
}
