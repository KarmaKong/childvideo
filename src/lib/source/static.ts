import { assetUrl, CATALOG_URL } from '../../config'
import type { Catalog, Video } from '../../types'
import type { CatalogSource, Playback } from './types'

/** 默认数据源：catalog.json + 对象存储 / CDN 相对路径。进度由前端本地存储负责。 */
export class StaticSource implements CatalogSource {
  async loadCatalog(): Promise<Catalog> {
    const r = await fetch(CATALOG_URL, { cache: 'no-cache' })
    if (!r.ok) throw new Error(`加载片库失败 (${r.status})`)
    const data = (await r.json()) as Catalog
    return {
      ...data,
      videos: data.videos.map((v) => ({
        ...v,
        kind: v.kind ?? (/\.m3u8($|\?)/i.test(v.src) ? 'hls' : 'mp4'),
      })),
    }
  }

  resolvePlayback(video: Video): Playback {
    return {
      src: assetUrl(video.src),
      kind: video.kind ?? (/\.m3u8($|\?)/i.test(video.src) ? 'hls' : 'mp4'),
    }
  }

  resolvePoster(video: Video): string | null {
    return video.poster ? assetUrl(video.poster) : null
  }
}
