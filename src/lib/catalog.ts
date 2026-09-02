import { useEffect, useState } from 'react'
import type { Catalog, Video } from '../types'
import { getSource } from './source'

let cache: Catalog | null = null
let inflight: Promise<Catalog> | null = null

export async function loadCatalog(): Promise<Catalog> {
  if (cache) return cache
  if (inflight) return inflight
  inflight = getSource()
    .loadCatalog()
    .then((data) => {
      cache = data
      return data
    })
    .finally(() => {
      inflight = null
    })
  return inflight
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
