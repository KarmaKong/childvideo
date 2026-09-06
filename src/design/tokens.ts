/**
 * LUMO Box · Design Tokens (single source of truth for JS-land)
 * Tailwind mirrors these in tailwind.config.js. Prefer Tailwind classes in components;
 * import from here only for inline styles that Tailwind cannot express (dynamic colors).
 *
 * 品牌：「孩子自己的小小放映厅」— round / soft / bright / spacious / calm。
 */

export const color = {
  brandBlue: '#2F8CF4', // 主 action / 当前导航 / play / active
  yellow: '#FFC541', // 品牌识别 / mascot / highlight
  cream: '#FFF9ED', // 主背景
  paper: '#FFFFFF',
  softBlue: '#DCEFFF', // 柔和填充 / active nav 背景
  cocoa: '#211A16', // 正文文字
  coral: '#FF8748', // 提醒 / 喜欢 / 趣味点缀
  mint: '#84D7BD', // 学习 / 成功 / positive
  // 文本层级（cocoa 的透明度阶）
  cocoa70: 'rgba(33,26,22,0.70)',
  cocoa50: 'rgba(33,26,22,0.50)',
  cocoa35: 'rgba(33,26,22,0.35)',
} as const

export const radius = {
  sm: '12px',
  md: '16px',
  card: '20px',
  video: '24px',
  panel: '28px',
  hero: '32px',
  pill: '999px',
} as const

export const shadow = {
  sm: '0 4px 12px rgba(35,75,120,0.06)',
  md: '0 8px 24px rgba(35,75,120,0.08)',
  floating: '0 12px 32px rgba(35,75,120,0.10)',
} as const

/** 8/4 栅格；只用这些值 */
export const space = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const

export const motion = {
  press: { scaleDown: 0.96, duration: 200 }, // 1 → .96 → 1
  hover: { lift: -4, duration: 220 },
  page: { duration: 300 },
  ease: 'cubic-bezier(0.22, 0.61, 0.36, 1)', // 平滑收尾，不过冲
} as const

export const touch = {
  min: 48,
  comfy: 56,
  primary: 64,
} as const

export const layout = {
  maxContent: 1440,
  readable: 1180,
} as const
