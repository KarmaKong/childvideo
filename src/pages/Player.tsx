import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSource } from '../lib/source'
import { findVideo, nextInSeries, useCatalog } from '../lib/catalog'
import { placeholderPoster } from '../lib/poster'
import { checkPlaybackAllowed, type BlockReason } from '../lib/guard'
import { useSettingsStore } from '../store/useSettingsStore'
import { useProgressStore } from '../store/useProgressStore'

function fmt(t: number): string {
  if (!Number.isFinite(t)) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function Player() {
  const { videoId = '' } = useParams()
  const nav = useNavigate()
  const { catalog } = useCatalog()
  const videoRef = useRef<HTMLVideoElement>(null)

  const settings = useSettingsStore()
  const dailyLimitMin = settings.dailyLimitMin
  const saveProgress = useProgressStore((s) => s.saveProgress)
  const addWatchedSeconds = useProgressStore((s) => s.addWatchedSeconds)
  const toggleFavorite = useProgressStore((s) => s.toggleFavorite)
  const remainingMinutes = useProgressStore((s) => s.remainingMinutes)
  const isFav = useProgressStore((s) => (videoId ? s.favorites.includes(videoId) : false))
  const savedPos = useProgressStore((s) => s.progress[videoId]?.position ?? 0)

  const video = catalog ? findVideo(catalog, videoId) : undefined
  const next = catalog && video ? nextInSeries(catalog, video) : undefined

  const [playing, setPlaying] = useState(false)
  const [cur, setCur] = useState(0)
  const [dur, setDur] = useState(0)
  const [locked, setLocked] = useState(false)
  const [showUI, setShowUI] = useState(true)
  const [ended, setEnded] = useState(false)
  const [block, setBlock] = useState<BlockReason>({ blocked: false })

  const lastTick = useRef<number | null>(null)
  const uiTimer = useRef<number | undefined>(undefined)
  const serverResume = useRef<number | null>(null)
  const lastReport = useRef(0)

  const pb = useMemo(() => (video ? getSource().resolvePlayback(video) : null), [video])
  const src = pb?.src ?? ''

  // 服务端续播位置（Jellyfin 多设备同步；静态源为 no-op）
  useEffect(() => {
    serverResume.current = null
    if (!video) return
    let alive = true
    getSource()
      .getResumePosition?.(video)
      .then((sec) => {
        if (alive) serverResume.current = sec
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [video])

  // ---- 加载源（含 HLS + 直连失败自动回退转码） ----
  useEffect(() => {
    const el = videoRef.current
    if (!el || !video || !pb) return
    setEnded(false)
    setCur(0)
    setDur(0)

    let hls: { destroy: () => void } | null = null
    let triedFallback = false

    const attach = (url: string, isHls: boolean) => {
      hls?.destroy()
      hls = null
      const nativeHls = el.canPlayType('application/vnd.apple.mpegurl')
      if (isHls && !nativeHls) {
        import('hls.js').then(({ default: Hls }) => {
          if (Hls.isSupported()) {
            const h = new Hls({ maxBufferLength: 30 })
            h.loadSource(url)
            h.attachMedia(el)
            hls = h
          } else {
            el.src = url
          }
        })
      } else {
        el.src = url
        el.load()
      }
    }

    const onError = () => {
      if (!triedFallback && pb.fallback) {
        triedFallback = true
        const at = el.currentTime
        attach(pb.fallback.src, pb.fallback.kind === 'hls')
        el.addEventListener(
          'loadedmetadata',
          () => {
            if (at > 1) el.currentTime = at
            el.play().catch(() => {})
          },
          { once: true },
        )
      }
    }
    el.addEventListener('error', onError)

    attach(pb.src, pb.kind === 'hls')

    return () => {
      el.removeEventListener('error', onError)
      hls?.destroy()
    }
  }, [src, video, pb])

  // ---- 播放守卫：就寝/时长限制 ----
  const runGuard = useCallback(() => {
    const b = checkPlaybackAllowed(settings, remainingMinutes(dailyLimitMin))
    setBlock(b)
    if (b.blocked) videoRef.current?.pause()
    return b
  }, [settings, remainingMinutes, dailyLimitMin])

  useEffect(() => {
    runGuard()
    const t = window.setInterval(runGuard, 20_000)
    return () => window.clearInterval(t)
  }, [runGuard])

  // ---- 事件绑定 ----
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const onLoaded = () => {
      setDur(el.duration || 0)
      const resumeAt = Math.max(savedPos, serverResume.current ?? 0)
      if (resumeAt > 3 && resumeAt < (el.duration || Infinity) - 10) {
        el.currentTime = resumeAt
      }
    }
    const onPlay = () => {
      if (runGuard().blocked) return
      setPlaying(true)
      lastTick.current = el.currentTime
      if (video) getSource().reportStart?.(video, el.currentTime)
    }
    const onPause = () => {
      setPlaying(false)
      flush(el)
      if (video) getSource().reportProgress?.(video, el.currentTime, true)
    }
    const onTime = () => {
      setCur(el.currentTime)
      // 累计真实观看时长（防拖动：delta 限制在 0~2s）
      if (lastTick.current != null) {
        const d = el.currentTime - lastTick.current
        if (d > 0 && d < 2) accWatched(d)
      }
      lastTick.current = el.currentTime
      // 每 ~10s 向服务端上报一次续播位置
      const now = Date.now()
      if (video && now - lastReport.current > 10_000) {
        lastReport.current = now
        getSource().reportProgress?.(video, el.currentTime, el.paused)
      }
    }
    const onEnded = () => {
      setPlaying(false)
      flush(el, true)
      if (settings.autoplayNext && next) {
        nav(`/watch/${next.id}`)
      } else {
        setEnded(true)
      }
    }

    el.addEventListener('loadedmetadata', onLoaded)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('ended', onEnded)
    return () => {
      el.removeEventListener('loadedmetadata', onLoaded)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('ended', onEnded)
      flush(el)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video, next, settings.autoplayNext, savedPos, runGuard])

  const watchedBuf = useRef(0)
  function accWatched(sec: number) {
    watchedBuf.current += sec
    if (watchedBuf.current >= 10) {
      addWatchedSeconds(watchedBuf.current)
      watchedBuf.current = 0
      runGuard()
    }
  }
  function flush(el: HTMLVideoElement, finished = false) {
    if (watchedBuf.current > 0) {
      addWatchedSeconds(watchedBuf.current)
      watchedBuf.current = 0
    }
    if (video && el.duration) {
      // 播完（或已到片尾）都不保留进度，避免「继续观看」里全是看完的视频
      const done = finished || el.ended || el.currentTime >= el.duration - 1.5
      saveProgress({
        videoId: video.id,
        position: done ? 0 : el.currentTime,
        duration: el.duration,
      })
      getSource().reportStop?.(video, done ? el.duration : el.currentTime)
    }
  }

  // ---- UI 自动隐藏 ----
  const pokeUI = useCallback(() => {
    setShowUI(true)
    window.clearTimeout(uiTimer.current)
    uiTimer.current = window.setTimeout(() => setShowUI(false), 3500)
  }, [])
  useEffect(() => {
    pokeUI()
    return () => window.clearTimeout(uiTimer.current)
  }, [pokeUI])

  function togglePlay() {
    const el = videoRef.current
    if (!el) return
    if (runGuard().blocked) return
    el.paused ? el.play() : el.pause()
    pokeUI()
  }
  function seek(delta: number) {
    const el = videoRef.current
    if (!el) return
    el.currentTime = Math.max(0, Math.min((el.duration || 0) - 1, el.currentTime + delta))
    lastTick.current = el.currentTime
    pokeUI()
  }
  function seekTo(e: ChangeEvent<HTMLInputElement>) {
    const el = videoRef.current
    if (!el) return
    const t = Number(e.target.value)
    el.currentTime = t
    lastTick.current = t
    setCur(t)
    pokeUI()
  }
  function goFullscreen() {
    const el = videoRef.current?.parentElement
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.()
  }

  // 锁屏：长按 1.5s 解锁
  const unlockTimer = useRef<number | undefined>(undefined)
  function startUnlock() {
    unlockTimer.current = window.setTimeout(() => setLocked(false), 1500)
  }
  function cancelUnlock() {
    window.clearTimeout(unlockTimer.current)
  }

  if (catalog && !video)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-white">
        <p className="text-xl">找不到这个视频 😕</p>
        <button className="btn-kid" onClick={() => nav('/')}>
          回首页
        </button>
      </div>
    )

  const poster = video ? (getSource().resolvePoster(video) ?? placeholderPoster(video.title)) : ''

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        className="h-full w-full object-contain"
        onClick={togglePlay}
      />

      {/* 锁屏遮罩 */}
      {locked && (
        <div className="absolute inset-0 z-40 flex items-end justify-center pb-10">
          <button
            onMouseDown={startUnlock}
            onMouseUp={cancelUnlock}
            onMouseLeave={cancelUnlock}
            onTouchStart={startUnlock}
            onTouchEnd={cancelUnlock}
            className="rounded-full bg-white/85 px-6 py-3 text-base font-bold text-gray-700 shadow-lg"
          >
            🔒 已锁定 · 长按解锁
          </button>
        </div>
      )}

      {/* 阻断遮罩（就寝 / 时长用尽） */}
      {block.blocked && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-black/85 p-8 text-center text-white">
          <div className="text-6xl">{block.kind === 'bedtime' ? '😴' : '🌙'}</div>
          <p className="max-w-xs text-xl font-bold">{block.message}</p>
          <button className="btn-kid" onClick={() => nav('/')}>
            好的
          </button>
        </div>
      )}

      {/* 播放结束推荐 */}
      {ended && !block.blocked && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/80 p-8 text-white">
          <p className="text-2xl font-extrabold">看完啦！🎉</p>
          <div className="flex gap-3">
            <button
              className="btn-ghost"
              onClick={() => {
                const el = videoRef.current!
                el.currentTime = 0
                el.play()
                setEnded(false)
              }}
            >
              🔁 再看一遍
            </button>
            {next && (
              <button className="btn-kid" onClick={() => nav(`/watch/${next.id}`)}>
                下一集 ›
              </button>
            )}
            <button className="btn-ghost" onClick={() => nav('/')}>
              🏠 回首页
            </button>
          </div>
        </div>
      )}

      {/* 控制层 */}
      {!locked && !block.blocked && (
        <div
          className={`absolute inset-0 z-20 flex flex-col justify-between transition-opacity ${
            showUI ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onMouseMove={pokeUI}
          onClick={pokeUI}
        >
          {/* 顶部 */}
          <div className="flex items-center gap-2 bg-gradient-to-b from-black/60 to-transparent p-4">
            <button
              className="rounded-full bg-white/20 px-4 py-2 text-lg font-bold text-white"
              onClick={() => nav('/')}
            >
              ‹ 返回
            </button>
            <span className="line-clamp-1 text-base font-bold text-white/90">
              {video?.title}
            </span>
            <div className="ml-auto flex gap-2">
              <button
                className="rounded-full bg-white/20 p-2 text-xl"
                onClick={() => video && toggleFavorite(video.id)}
                aria-label="收藏"
              >
                {isFav ? '⭐' : '☆'}
              </button>
              <button
                className="rounded-full bg-white/20 p-2 text-xl"
                onClick={() => setLocked(true)}
                aria-label="锁屏"
              >
                🔓
              </button>
              <button
                className="rounded-full bg-white/20 p-2 text-xl"
                onClick={goFullscreen}
                aria-label="全屏"
              >
                ⛶
              </button>
            </div>
          </div>

          {/* 中间大按钮 */}
          <div className="flex items-center justify-center gap-8">
            <button className="text-5xl drop-shadow-lg" onClick={() => seek(-10)}>
              ⏪
            </button>
            <button
              className="flex h-24 w-24 items-center justify-center rounded-full bg-white/25 text-5xl backdrop-blur"
              onClick={togglePlay}
            >
              {playing ? '⏸️' : '▶️'}
            </button>
            <button className="text-5xl drop-shadow-lg" onClick={() => seek(10)}>
              ⏩
            </button>
          </div>

          {/* 底部进度 */}
          <div className="bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center gap-3 text-sm font-bold text-white">
              <span>{fmt(cur)}</span>
              <input
                type="range"
                min={0}
                max={dur || 0}
                step={1}
                value={cur}
                onChange={seekTo}
                className="h-2 flex-1 cursor-pointer accent-kid-primary"
              />
              <span>{fmt(dur)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
