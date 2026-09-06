import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSource } from '../lib/source'
import { findVideo, nextInSeries, useCatalog } from '../lib/catalog'
import { placeholderPoster } from '../lib/poster'
import { checkPlaybackAllowed, type BlockReason } from '../lib/guard'
import {
  ChevLeft,
  Expand,
  Lock,
  Pause,
  Play,
  Replay,
  Star,
  StarLine,
  EpisodesIcon,
  SpeedIcon,
  TimerIcon,
  SubtitleIcon,
} from '../components/icons'
import { Modal } from '../components/lumo/Feedback'
import { useSettingsStore } from '../store/useSettingsStore'
import { useProgressStore } from '../store/useProgressStore'

const RATES = [1, 1.5, 2] as const
const TIMERS = [0, 15, 30] as const

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
  const [rate, setRate] = useState(1)
  const [sleepMin, setSleepMin] = useState(0)
  const [sheet, setSheet] = useState<null | 'eps'>(null)
  const [subsOn, setSubsOn] = useState(false)
  const sleepTimer = useRef<number | undefined>(undefined)

  const episodes = useMemo(() => {
    if (!catalog || !video?.series) return []
    return catalog.videos
      .filter((v) => v.series === video.series)
      .sort((a, b) => (a.episode ?? 0) - (b.episode ?? 0))
  }, [catalog, video])

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

  // 倍速
  function cycleRate() {
    const nextRate = RATES[(RATES.indexOf(rate as (typeof RATES)[number]) + 1) % RATES.length]
    setRate(nextRate)
    if (videoRef.current) videoRef.current.playbackRate = nextRate
    pokeUI()
  }
  // 定时（到点暂停）
  function cycleSleep() {
    const nextT = TIMERS[(TIMERS.indexOf(sleepMin as (typeof TIMERS)[number]) + 1) % TIMERS.length]
    setSleepMin(nextT)
    window.clearTimeout(sleepTimer.current)
    if (nextT > 0) {
      sleepTimer.current = window.setTimeout(() => {
        videoRef.current?.pause()
        setSleepMin(0)
      }, nextT * 60_000)
    }
    pokeUI()
  }
  // 字幕
  function toggleSubs() {
    const el = videoRef.current
    if (!el || !el.textTracks.length) return
    const on = !subsOn
    for (const t of Array.from(el.textTracks)) t.mode = on ? 'showing' : 'hidden'
    setSubsOn(on)
    pokeUI()
  }
  useEffect(() => () => window.clearTimeout(sleepTimer.current), [])

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
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-ink text-white">
        <div className="text-6xl">🙈</div>
        <p className="text-xl font-black">这个视频不见啦</p>
        <button className="btn-kid" onClick={() => nav('/')}>
          回家
        </button>
      </div>
    )

  const poster = video ? (getSource().resolvePoster(video) ?? placeholderPoster(video.title)) : ''
  const nextPoster = next
    ? (getSource().resolvePoster(next) ?? placeholderPoster(next.title))
    : ''

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-lumo-night">
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        className="h-full w-full object-contain"
        onClick={togglePlay}
      />

      {/* 锁屏遮罩：按住小锁解锁 */}
      {locked && (
        <div className="absolute inset-0 z-40 flex items-end justify-center pb-12">
          <button
            onMouseDown={startUnlock}
            onMouseUp={cancelUnlock}
            onMouseLeave={cancelUnlock}
            onTouchStart={startUnlock}
            onTouchEnd={cancelUnlock}
            className="flex items-center gap-3 rounded-pill bg-white/90 px-6 py-4 text-lg font-extrabold text-ink shadow-toysm active:scale-95"
          >
            <Lock className="h-6 w-6" /> 已锁住 · 按住这里
          </button>
        </div>
      )}

      {/* 阻断遮罩（就寝 / 时长用尽） */}
      {block.blocked && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-lumo-night/97 p-8 text-center text-white">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full text-6xl"
            style={{ background: 'rgba(232,67,59,0.16)' }}
          >
            {block.kind === 'bedtime' ? '🌙' : '⏰'}
          </div>
          <p className="max-w-xs text-2xl font-black leading-snug">{block.message}</p>
          <button className="btn-amber" onClick={() => nav('/')}>
            好哒
          </button>
        </div>
      )}

      {/* 播放结束推荐 */}
      {ended && !block.blocked && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-ink/92 p-6 text-white">
          <p className="text-3xl font-black">看完啦 🎉</p>
          <div className="flex flex-wrap items-stretch justify-center gap-4">
            <button
              className="press flex w-40 flex-col items-center gap-2 rounded-blob bg-white/10 p-4"
              onClick={() => {
                const el = videoRef.current!
                el.currentTime = 0
                el.play()
                setEnded(false)
              }}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-ink">
                <Replay className="h-8 w-8" />
              </span>
              <span className="font-extrabold">再看一遍</span>
            </button>

            {next && (
              <button
                className="press flex w-40 flex-col items-center gap-2 rounded-blob bg-white p-3 text-ink"
                onClick={() => nav(`/watch/${next.id}`)}
              >
                <img
                  src={nextPoster}
                  alt=""
                  className="aspect-video w-full rounded-2xl object-cover"
                />
                <span className="line-clamp-1 text-sm font-extrabold">下一个：{next.title}</span>
              </button>
            )}
          </div>
          <button
            className="rounded-pill bg-white/15 px-6 py-3 font-extrabold"
            onClick={() => nav('/')}
          >
            回家
          </button>
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
          {/* 顶部：返回 / 收藏 / 锁 */}
          <div className="flex items-center gap-3 bg-gradient-to-b from-black/60 to-transparent p-4">
            <button
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/35 text-white active:scale-95"
              onClick={() => nav('/')}
              aria-label="返回"
            >
              <ChevLeft className="h-6 w-6" />
            </button>
            <span className="line-clamp-1 text-body font-bold text-white/90 drop-shadow">
              {video?.title}
            </span>
            <div className="ml-auto flex shrink-0 gap-2">
              <button
                className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 active:scale-95"
                onClick={() => video && toggleFavorite(video.id)}
                aria-label="收藏"
                style={{ color: isFav ? '#FFC83D' : '#fff' }}
              >
                {isFav ? <Star className="h-6 w-6" /> : <StarLine className="h-6 w-6" />}
              </button>
              <button
                className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-white active:scale-95"
                onClick={() => setLocked(true)}
                aria-label="锁屏"
              >
                <Lock className="h-6 w-6" />
              </button>
              <button
                className="hidden h-11 w-11 items-center justify-center rounded-full bg-black/35 text-white active:scale-95 sm:flex"
                onClick={goFullscreen}
                aria-label="全屏"
              >
                <Expand className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* 底部：黄进度条 + 选集/倍速/播放/定时/字幕 */}
          <div className="bg-gradient-to-t from-black/75 to-transparent px-5 pb-6 pt-8">
            <div className="flex items-center gap-3 text-body2 font-bold tabular-nums text-white">
              <span>{fmt(cur)}</span>
              <input
                type="range"
                className="seek flex-1"
                min={0}
                max={dur || 0}
                step={1}
                value={cur}
                onChange={seekTo}
                aria-label="进度"
              />
              <span>{fmt(dur)}</span>
            </div>

            <div className="mt-4 flex items-end justify-center gap-6 sm:gap-10">
              <PlayerCtl
                label="选集"
                disabled={episodes.length < 2}
                onClick={() => setSheet('eps')}
              >
                <EpisodesIcon className="h-6 w-6" />
              </PlayerCtl>
              <PlayerCtl label={`倍速 ${rate}x`} onClick={cycleRate}>
                <SpeedIcon className="h-6 w-6" />
              </PlayerCtl>

              <button
                onClick={togglePlay}
                aria-label={playing ? '暂停' : '播放'}
                className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-white text-lumo-blue shadow-floating active:scale-90"
              >
                {playing ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 translate-x-[2px]" />
                )}
              </button>

              <PlayerCtl label={sleepMin ? `${sleepMin} 分` : '定时'} onClick={cycleSleep}>
                <TimerIcon className="h-6 w-6" />
              </PlayerCtl>
              <PlayerCtl label="字幕" active={subsOn} onClick={toggleSubs}>
                <SubtitleIcon className="h-6 w-6" />
              </PlayerCtl>
            </div>
          </div>
        </div>
      )}

      {/* 选集 */}
      <Modal open={sheet === 'eps'} onClose={() => setSheet(null)}>
        <p className="mb-3 text-title-2 text-lumo-ink">选集</p>
        <div className="grid max-h-[60vh] grid-cols-4 gap-2 overflow-y-auto">
          {episodes.map((ep) => (
            <button
              key={ep.id}
              onClick={() => {
                setSheet(null)
                if (ep.id !== video?.id) nav(`/watch/${ep.id}`)
              }}
              className={`flex h-12 items-center justify-center rounded-md text-card font-bold ${
                ep.id === video?.id
                  ? 'bg-lumo-blue text-white'
                  : 'bg-lumo-soft-blue text-lumo-blue'
              }`}
            >
              {ep.episode ?? '·'}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}

function PlayerCtl({
  label,
  children,
  onClick,
  disabled,
  active,
}: {
  label: string
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-1.5 ${disabled ? 'opacity-35' : 'active:scale-90'}`}
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full ${
          active ? 'bg-lumo-yellow text-lumo-ink' : 'bg-black/40 text-white'
        }`}
      >
        {children}
      </span>
      <span className="whitespace-nowrap text-label font-semibold text-white/85">{label}</span>
    </button>
  )
}
