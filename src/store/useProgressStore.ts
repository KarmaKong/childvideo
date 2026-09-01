import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export interface WatchEntry {
  videoId: string
  /** 播放位置（秒） */
  position: number
  /** 时长（秒），用于判断是否看完 */
  duration: number
  updatedAt: number
}

interface ProgressState {
  /** videoId -> 观看进度 */
  progress: Record<string, WatchEntry>
  /** 最近观看的 videoId，最新在前 */
  history: string[]
  favorites: string[]
  /** 当日已观看秒数 */
  watchedDate: string
  watchedSec: number

  saveProgress: (e: Omit<WatchEntry, 'updatedAt'>) => void
  addWatchedSeconds: (sec: number) => void
  toggleFavorite: (videoId: string) => void
  clearHistory: () => void
  /** 返回今日剩余可看分钟数；limitMin=0 表示不限 -> Infinity */
  remainingMinutes: (limitMin: number) => number
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: {},
      history: [],
      favorites: [],
      watchedDate: today(),
      watchedSec: 0,

      saveProgress: (e) =>
        set((st) => ({
          progress: {
            ...st.progress,
            [e.videoId]: { ...e, updatedAt: Date.now() },
          },
          history: [e.videoId, ...st.history.filter((id) => id !== e.videoId)].slice(0, 30),
        })),

      addWatchedSeconds: (sec) =>
        set((st) => {
          const d = today()
          const base = st.watchedDate === d ? st.watchedSec : 0
          return { watchedDate: d, watchedSec: base + Math.max(0, sec) }
        }),

      toggleFavorite: (videoId) =>
        set((st) => ({
          favorites: st.favorites.includes(videoId)
            ? st.favorites.filter((id) => id !== videoId)
            : [videoId, ...st.favorites],
        })),

      clearHistory: () => set({ history: [], progress: {} }),

      remainingMinutes: (limitMin) => {
        if (!limitMin) return Infinity
        const st = get()
        const used = st.watchedDate === today() ? st.watchedSec : 0
        return Math.max(0, limitMin - used / 60)
      },
    }),
    { name: 'cv.progress.v1' },
  ),
)
