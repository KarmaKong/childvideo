import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ParentalSettings {
  /** 每日观看时长上限（分钟）。0 = 不限制 */
  dailyLimitMin: number
  /** 到点锁定：'HH:MM' 之后禁止播放。空串 = 不启用 */
  bedtime: string
  /** 允许的分类 id 列表；空数组视为「全部允许」 */
  allowedCategories: string[]
  /** 按年龄上限过滤：仅显示 minAge <= maxAge 的视频。0 = 不限制 */
  maxAge: number
  /** 单集播完是否自动播下一集 */
  autoplayNext: boolean
  /** 家长验证码（4 位数字）。用于家长锁兜底；默认走随机算术题 */
  parentPin: string
}

interface SettingsState extends ParentalSettings {
  set: (patch: Partial<ParentalSettings>) => void
  reset: () => void
}

const DEFAULTS: ParentalSettings = {
  dailyLimitMin: 30,
  bedtime: '',
  allowedCategories: [],
  maxAge: 0,
  autoplayNext: true,
  parentPin: '',
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      set: (patch) => set(patch),
      reset: () => set(DEFAULTS),
    }),
    { name: 'cv.settings.v1' },
  ),
)

export function isCategoryAllowed(s: ParentalSettings, categoryId: string): boolean {
  return s.allowedCategories.length === 0 || s.allowedCategories.includes(categoryId)
}
