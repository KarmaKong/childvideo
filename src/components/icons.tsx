/**
 * LUMO Box 图标：统一用 lucide-react，一套 rounded / friendly / bold 线性图标。
 * 按项目里已有的名字再导出，方便逐步迁移；新代码可直接 import from 'lucide-react'。
 * 统一 strokeWidth 2.25。
 */
import {
  ChevronLeft,
  ChevronRight,
  Play as LPlay,
  Pause as LPause,
  RotateCcw,
  RotateCw,
  Lock as LLock,
  Maximize,
  Star as LStar,
  House,
  Users,
  Search,
  Heart,
  Sparkles,
  GraduationCap,
  Clapperboard,
  Clock,
  Moon,
  UserRound,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react'

function mk(Icon: LucideIcon, extra: Partial<LucideProps> = {}) {
  return function LumoIcon(props: LucideProps) {
    return <Icon strokeWidth={2.25} {...extra} {...props} />
  }
}
const solid: Partial<LucideProps> = { fill: 'currentColor', strokeWidth: 0 }

// 旧名字（保持调用方不变）
export const Play = mk(LPlay, solid)
export const Pause = mk(LPause, solid)
export const Back10 = mk(RotateCcw)
export const Fwd10 = mk(RotateCw)
export const Replay = mk(RotateCcw)
export const ChevLeft = mk(ChevronLeft)
export const ChevRight = mk(ChevronRight)
export const Lock = mk(LLock)
export const Expand = mk(Maximize)
export const Star = mk(LStar, solid)
export const StarLine = mk(LStar)
export const Home = mk(House)
export const Parent = mk(Users)

// 新增（导航 / 页面用）
export const SearchIcon = mk(Search)
export const HeartIcon = mk(Heart)
export const HeartFill = mk(Heart, solid)
export const LearnIcon = mk(GraduationCap)
export const CartoonIcon = mk(Clapperboard)
export const SparkIcon = mk(Sparkles)
export const ClockIcon = mk(Clock)
export const MoonIcon = mk(Moon)
export const MeIcon = mk(UserRound)
