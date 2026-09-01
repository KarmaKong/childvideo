import type { ParentalSettings } from '../store/useSettingsStore'

export type BlockReason =
  | { blocked: false }
  | { blocked: true; kind: 'limit'; message: string }
  | { blocked: true; kind: 'bedtime'; message: string }

/** 是否已过就寝锁定时间 */
export function isPastBedtime(bedtime: string, now = new Date()): boolean {
  if (!bedtime) return false
  const [h, m] = bedtime.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return false
  const cur = now.getHours() * 60 + now.getMinutes()
  return cur >= h * 60 + m
}

export function checkPlaybackAllowed(
  settings: ParentalSettings,
  remainingMinutes: number,
): BlockReason {
  if (isPastBedtime(settings.bedtime)) {
    return {
      blocked: true,
      kind: 'bedtime',
      message: `到点啦（${settings.bedtime}），该休息眼睛咯 😴`,
    }
  }
  if (settings.dailyLimitMin > 0 && remainingMinutes <= 0) {
    return {
      blocked: true,
      kind: 'limit',
      message: `今天的观看时间用完啦，明天再来吧 🌙`,
    }
  }
  return { blocked: false }
}
