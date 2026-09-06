/**
 * LUMO Box · Design Tokens —— 严格对齐品牌规范图。
 * Tailwind 在 tailwind.config.js 镜像这些值。组件优先用 Tailwind class，
 * 只有动态色值才从这里 import 到 inline style。
 *
 * 品牌：「儿童专属的视频探索盒子」。圆润 · 明亮 · 留白 · 亲和。
 */

/* 01. 品牌色彩（规范精确值） */
export const color = {
  blue: '#3A7CFF', // 主 action / 当前导航 / play
  softBlue: '#E8F2FF', // 淡蓝：面板背景 / active 底
  yellow: '#FFC83D', // 品牌 / mascot / highlight / 进度条
  coral: '#FF8A3D', // 提醒 / 喜欢 / 趣味点缀
  green: '#48C47D', // 学习 / 成功 / positive
  purple: '#A78DFA', // 次要点缀 / 分类
  white: '#FFFFFF',
  page: '#F5F8FF', // 页面底（极淡蓝白），面板用纯白托起
  ink: '#232227', // 正文
  ink70: 'rgba(35,34,39,0.68)',
  ink50: 'rgba(35,34,39,0.48)',
  ink35: 'rgba(35,34,39,0.32)',
} as const

/* 02. 字体规范 */
export const type = {
  title1: { size: 28, weight: 700 },
  title2: { size: 22, weight: 700 },
  body1: { size: 16, weight: 400 },
  body2: { size: 14, weight: 400 },
  caption: { size: 12, weight: 400 },
  label: { size: 11, weight: 500 },
} as const

/* 圆角 */
export const radius = {
  sm: '12px',
  md: '16px',
  card: '20px',
  video: '22px',
  panel: '24px',
  hero: '28px',
  pill: '999px',
} as const

/* 阴影：极柔，无黑色 drop */
export const shadow = {
  sm: '0 4px 12px rgba(35,75,120,0.06)',
  md: '0 8px 24px rgba(35,75,120,0.08)',
  floating: '0 16px 40px rgba(35,75,120,0.12)',
} as const

/* 8/4 栅格 */
export const space = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const

export const motion = {
  press: { scaleDown: 0.96, duration: 200 },
  hover: { lift: -4, duration: 220 },
  page: { duration: 300 },
  ease: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
} as const

export const touch = { min: 48, comfy: 56, primary: 64 } as const
export const layout = { maxContent: 1440, readable: 1120 } as const

/* 分类彩色（规范图里「热门分类」每格一个颜色） */
export const categoryTint = ['#FF8A3D', '#3A7CFF', '#A78DFA', '#48C47D', '#FFC83D', '#A78DFA', '#FF8A3D'] as const
