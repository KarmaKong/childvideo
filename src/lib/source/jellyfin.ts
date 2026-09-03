import { runtimeConfig } from '../../runtime-config'
import type { Catalog, Category, Video } from '../../types'
import type { CatalogSource, Playback } from './types'

// ---- 配置：优先 config.json 的 jellyfin.*，回退 import.meta.env.VITE_JELLYFIN_* ----
type CategoryMode = 'genre' | 'collection' | 'folder'
type StreamMode = 'direct' | 'hls'

interface JfCfg {
  base: string
  key: string
  userId: string
  libraryId: string
  categoryMode: CategoryMode
  stream: StreamMode
}

function jf(): JfCfg {
  const rc = runtimeConfig().jellyfin ?? {}
  const pick = (a: string | undefined, b: string | undefined) => (a ?? b ?? '').trim()
  const cm = pick(rc.categoryMode, import.meta.env.VITE_JELLYFIN_CATEGORY_MODE) || 'genre'
  const sm = pick(rc.stream, import.meta.env.VITE_JELLYFIN_STREAM) || 'direct'
  return {
    base: pick(rc.base, import.meta.env.VITE_JELLYFIN_BASE).replace(/\/+$/, ''),
    key: pick(rc.key, import.meta.env.VITE_JELLYFIN_KEY),
    userId: pick(rc.userId, import.meta.env.VITE_JELLYFIN_USER_ID),
    libraryId: pick(rc.libraryId, import.meta.env.VITE_JELLYFIN_LIBRARY_ID),
    categoryMode: (['genre', 'collection', 'folder'].includes(cm) ? cm : 'genre') as CategoryMode,
    stream: (sm === 'hls' ? 'hls' : 'direct') as StreamMode,
  }
}

export function jellyfinConfigured(): boolean {
  const c = jf()
  return Boolean(c.base && c.key && c.userId)
}

const TICKS = 1e7 // 1 秒 = 10,000,000 ticks

// ---- 设备标识（会话上报需要稳定 DeviceId） ----
let _deviceId = ''
function deviceId(): string {
  if (_deviceId) return _deviceId
  try {
    _deviceId = localStorage.getItem('cv.jf.deviceId') ?? ''
  } catch {
    /* ignore */
  }
  if (!_deviceId) {
    _deviceId = `cv-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
    try {
      localStorage.setItem('cv.jf.deviceId', _deviceId)
    } catch {
      /* ignore */
    }
  }
  return _deviceId
}

function authHeader(): string {
  return `MediaBrowser Token="${jf().key}", Client="XiaoXiaoCinema", Device="Web", DeviceId="${deviceId()}", Version="1.0"`
}

function api(path: string): string {
  return `${jf().base}${path}`
}

async function getJson<T>(path: string): Promise<T> {
  const r = await fetch(api(path), {
    headers: { Authorization: authHeader(), 'X-Emby-Token': jf().key },
  })
  if (!r.ok) throw new Error(`Jellyfin ${path} -> ${r.status}`)
  return (await r.json()) as T
}

function post(path: string, body: unknown, keepalive = false): void {
  fetch(api(path), {
    method: 'POST',
    keepalive,
    headers: {
      Authorization: authHeader(),
      'X-Emby-Token': jf().key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).catch(() => {
    /* 进度上报失败不影响播放 */
  })
}

// ---- Jellyfin 返回结构（只列用到的字段） ----
interface JfItem {
  Id: string
  Name: string
  Type: string
  Genres?: string[]
  SeriesId?: string
  SeriesName?: string
  IndexNumber?: number
  RunTimeTicks?: number
  OfficialRating?: string
  Path?: string
  ImageTags?: { Primary?: string }
  UserData?: { PlaybackPositionTicks?: number; PlayedPercentage?: number }
}
interface JfItemsResp {
  Items: JfItem[]
}
interface JfView {
  Id: string
  Name: string
  CollectionType?: string
}

interface Meta {
  primaryTag?: string
  resumeSec: number
}

function parseAge(rating?: string): number | undefined {
  if (!rating) return undefined
  const m = rating.match(/(\d+)/)
  return m ? Number(m[1]) : undefined
}

/** 从标题里推断系列与集号（用于 homevideos 库这类没有真正剧集结构的内容） */
function deriveSeries(title: string): { series?: string; episode?: number } {
  const m = title.match(/^(.*?)[\s_·-]*(?:第\s*(\d+)\s*集|[Ee][Pp]?\.?\s*(\d+)|\((\d+)\))\s*$/)
  if (!m) return {}
  const ep = Number(m[2] || m[3] || m[4])
  const series = m[1].trim()
  if (!series || !Number.isFinite(ep)) return {}
  return { series, episode: ep }
}

/**
 * folder 模式：用视频文件所在的「顶层子文件夹名」当分类。
 * 例：库根 /media，文件 /media/Numberblocks/S1/ep1.mp4 -> 分类 "Numberblocks"。
 * 直接放在库根下的文件 -> "精选"。
 */
function folderCategory(path: string | undefined, roots: string[]): string {
  if (!path) return '精选'
  const norm = (s: string) => s.replace(/\\/g, '/').replace(/\/+$/, '')
  const p = norm(path)
  for (const r of roots.map(norm).sort((a, b) => b.length - a.length)) {
    if (r && (p === r || p.startsWith(r + '/'))) {
      const rest = p.slice(r.length + 1)
      const seg = rest.split('/')[0]
      return rest.includes('/') && seg ? seg : '精选'
    }
  }
  // 没匹配到库根：退化用文件的父目录名
  const parts = p.split('/')
  return parts.length >= 2 ? parts[parts.length - 2] : '精选'
}

const FIELDS =
  'Genres,SeriesName,IndexNumber,ParentIndexNumber,RunTimeTicks,OfficialRating,Overview,Path'

export class JellyfinSource implements CatalogSource {
  private meta = new Map<string, Meta>()
  private session: { itemId: string; playSessionId: string } | null = null

  private async parentIds(): Promise<string[]> {
    const c = jf()
    if (c.libraryId) return [c.libraryId]
    const views = await getJson<{ Items: JfView[] }>(`/Users/${c.userId}/Views`)
    return views.Items.map((v) => v.Id)
  }

  /** 所有媒体库在磁盘上的根路径（folder 分类模式用）；拿不到就返回 [] */
  private async libraryRoots(): Promise<string[]> {
    try {
      const vfs = await getJson<Array<{ Locations?: string[] }>>('/Library/VirtualFolders')
      return vfs.flatMap((v) => v.Locations ?? [])
    } catch {
      return []
    }
  }

  private mapItem(it: JfItem, category: string): Video {
    this.meta.set(it.Id, {
      primaryTag: it.ImageTags?.Primary,
      resumeSec: (it.UserData?.PlaybackPositionTicks ?? 0) / TICKS,
    })
    const title =
      it.Type === 'Episode' && it.SeriesName
        ? `${it.SeriesName} ${it.IndexNumber != null ? it.IndexNumber + '. ' : ''}${it.Name}`
        : it.Name
    const derived = it.IndexNumber != null ? {} : deriveSeries(title)
    return {
      id: it.Id,
      title,
      category,
      src: it.Id,
      kind: jf().stream === 'hls' ? 'hls' : 'mp4',
      duration: it.RunTimeTicks ? Math.round(it.RunTimeTicks / TICKS) : undefined,
      series: it.SeriesId ?? it.SeriesName ?? derived.series,
      episode: it.IndexNumber ?? derived.episode,
      minAge: parseAge(it.OfficialRating),
    }
  }

  async loadCatalog(): Promise<Catalog> {
    if (!jellyfinConfigured())
      throw new Error('Jellyfin 未配置：请检查 config.json 的 jellyfin.base / key / userId')

    const c = jf()
    const parents = await this.parentIds()
    this.meta.clear()

    const videos: Video[] = []
    const catOrder: string[] = []
    const addCat = (name: string) => {
      if (!catOrder.includes(name)) catOrder.push(name)
    }

    if (c.categoryMode === 'collection') {
      // 分类 = 合集(BoxSet)；不属于任何合集的归入「精选」
      for (const pid of parents) {
        const sets = await getJson<JfItemsResp>(
          `/Users/${c.userId}/Items?ParentId=${pid}&IncludeItemTypes=BoxSet&Recursive=true`,
        )
        const claimed = new Set<string>()
        for (const set of sets.Items) {
          addCat(set.Name)
          const children = await getJson<JfItemsResp>(
            `/Users/${c.userId}/Items?ParentId=${set.Id}&Fields=${FIELDS}&SortBy=SortName`,
          )
          for (const it of children.Items) {
            claimed.add(it.Id)
            videos.push(this.mapItem(it, set.Name))
          }
        }
        const all = await getJson<JfItemsResp>(
          `/Users/${c.userId}/Items?ParentId=${pid}&Recursive=true&IncludeItemTypes=Movie,Episode,Video&Fields=${FIELDS}&SortBy=SeriesSortName,SortName`,
        )
        for (const it of all.Items) {
          if (claimed.has(it.Id)) continue
          addCat('精选')
          videos.push(this.mapItem(it, '精选'))
        }
      }
    } else if (c.categoryMode === 'folder') {
      // 分类 = 视频文件的顶层子文件夹名（适合「整夹丢进去、没 NFO」的情况）
      const roots = await this.libraryRoots()
      for (const pid of parents) {
        const resp = await getJson<JfItemsResp>(
          `/Users/${c.userId}/Items?ParentId=${pid}&Recursive=true&IncludeItemTypes=Movie,Episode,Video&Fields=${FIELDS}&SortBy=SortName&SortOrder=Ascending&ImageTypeLimit=1&EnableImageTypes=Primary`,
        )
        for (const it of resp.Items) {
          const cat = folderCategory(it.Path, roots)
          addCat(cat)
          videos.push(this.mapItem(it, cat))
        }
      }
    } else {
      // 分类 = 第一个 Genre（入库 CLI 会写成分类名）；无 Genre 归入「精选」
      for (const pid of parents) {
        const resp = await getJson<JfItemsResp>(
          `/Users/${c.userId}/Items?ParentId=${pid}&Recursive=true&IncludeItemTypes=Movie,Episode,Video&Fields=${FIELDS}&SortBy=SeriesSortName,SortName&SortOrder=Ascending&ImageTypeLimit=1&EnableImageTypes=Primary`,
        )
        for (const it of resp.Items) {
          const cat = it.Genres?.[0] ?? '精选'
          addCat(cat)
          videos.push(this.mapItem(it, cat))
        }
      }
    }

    const ICONS = ['🎵', '🐰', '🔬', '📖', '🚗', '🎨', '🐘', '⚽']
    const COLORS = ['#ff7a59', '#4dabf7', '#51cf66', '#9775fa', '#ffd43b', '#ff8787']
    const categories: Category[] = catOrder.map((name, i) => ({
      id: name,
      name,
      icon: ICONS[i % ICONS.length],
      color: COLORS[i % COLORS.length],
    }))

    return { version: 1, categories, videos }
  }

  private hlsUrl(video: Video): string {
    const q = new URLSearchParams({
      api_key: jf().key,
      MediaSourceId: video.id,
      DeviceId: deviceId(),
      PlaySessionId: this.session?.playSessionId ?? `${deviceId()}-${Date.now()}`,
      VideoCodec: 'h264',
      AudioCodec: 'aac',
      TranscodingContainer: 'ts',
      TranscodingProtocol: 'hls',
    })
    return api(`/Videos/${video.id}/master.m3u8?${q}`)
  }

  resolvePlayback(video: Video): Playback {
    const c = jf()
    this.session = {
      itemId: video.id,
      playSessionId: `${deviceId()}-${Date.now()}`,
    }
    if (c.stream === 'hls') {
      return { src: this.hlsUrl(video), kind: 'hls' }
    }
    // direct：直连原文件；浏览器放不了的（mkv / hevc / ac3…）自动回退到转码 HLS
    const q = new URLSearchParams({
      api_key: c.key,
      static: 'true',
      MediaSourceId: video.id,
    })
    return {
      src: api(`/Videos/${video.id}/stream?${q}`),
      kind: 'mp4',
      fallback: { src: this.hlsUrl(video), kind: 'hls' },
    }
  }

  resolvePoster(video: Video): string | null {
    const tag = this.meta.get(video.id)?.primaryTag
    if (!tag) return null
    const q = new URLSearchParams({ fillWidth: '480', quality: '90', tag, api_key: jf().key })
    return api(`/Items/${video.id}/Images/Primary?${q}`)
  }

  async getResumePosition(video: Video): Promise<number | null> {
    const cached = this.meta.get(video.id)?.resumeSec
    if (cached != null) return cached > 5 ? cached : null
    try {
      const it = await getJson<JfItem>(`/Users/${jf().userId}/Items/${video.id}`)
      const sec = (it.UserData?.PlaybackPositionTicks ?? 0) / TICKS
      return sec > 5 ? sec : null
    } catch {
      return null
    }
  }

  reportStart(video: Video, positionSec: number): void {
    if (!this.session || this.session.itemId !== video.id) this.resolvePlayback(video)
    post('/Sessions/Playing', {
      ItemId: video.id,
      PlaySessionId: this.session?.playSessionId,
      PositionTicks: Math.round(positionSec * TICKS),
      PlayMethod: jf().stream === 'hls' ? 'Transcode' : 'DirectStream',
      CanSeek: true,
    })
  }

  reportProgress(video: Video, positionSec: number, paused: boolean): void {
    post('/Sessions/Playing/Progress', {
      ItemId: video.id,
      PlaySessionId: this.session?.playSessionId,
      PositionTicks: Math.round(positionSec * TICKS),
      IsPaused: paused,
      PlayMethod: jf().stream === 'hls' ? 'Transcode' : 'DirectStream',
      CanSeek: true,
      EventName: 'timeupdate',
    })
  }

  reportStop(video: Video, positionSec: number): void {
    post(
      '/Sessions/Playing/Stopped',
      {
        ItemId: video.id,
        PlaySessionId: this.session?.playSessionId,
        PositionTicks: Math.round(positionSec * TICKS),
      },
      true,
    )
  }
}
