/**
 * LUMO Box 图标：lucide-react 一套。按项目里已有的名字再导出，方便迁移。
 * 默认 strokeWidth 2.25；solid 版用 fill 无描边（对齐规范「圆润实心」）。
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
  Compass,
  Crown,
  UserRound,
  Users,
  Search,
  Heart,
  Sparkles,
  GraduationCap,
  Clapperboard,
  Clock,
  Moon,
  SlidersHorizontal,
  ListVideo,
  Gauge,
  Timer,
  Captions,
  Music2,
  Languages,
  FlaskConical,
  BookOpen,
  Puzzle,
  AudioLines,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react'

function mk(Icon: LucideIcon, extra: Partial<LucideProps> = {}) {
  return function LumoIcon(props: LucideProps) {
    return <Icon strokeWidth={2.25} {...extra} {...props} />
  }
}
const solid: Partial<LucideProps> = { fill: 'currentColor', strokeWidth: 0 }

// 旧名字
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
export const Home = mk(House, solid)
export const HomeLine = mk(House)
export const Parent = mk(Users)

// 导航
export const DiscoverIcon = mk(Compass, solid)
export const VipIcon = mk(Crown, solid)
export const MeIcon = mk(UserRound, solid)
export const SearchIcon = mk(Search)

// 页面 / 播放器
export const HeartIcon = mk(Heart)
export const HeartFill = mk(Heart, solid)
export const LearnIcon = mk(GraduationCap)
export const CartoonIcon = mk(Clapperboard)
export const SparkIcon = mk(Sparkles, solid)
export const ClockIcon = mk(Clock)
export const MoonIcon = mk(Moon)
export const FilterIcon = mk(SlidersHorizontal)
export const EpisodesIcon = mk(ListVideo)
export const SpeedIcon = mk(Gauge)
export const TimerIcon = mk(Timer)
export const SubtitleIcon = mk(Captions)

// 内容分区图标（逐步替代 emoji）
export const SongsIcon = mk(Music2)
export const EnglishIcon = mk(Languages)
export const ScienceIcon = mk(FlaskConical)
export const StoryIcon = mk(BookOpen)
export const PuzzleIcon = mk(Puzzle)
export const MusicIcon = mk(AudioLines)
