/** @type {import('tailwindcss').Config} */
// LUMO Box 配色：取自 logo —— 琥珀黄（猫）、钴蓝（沙发）、深蓝黑（平板屏）、暖白、爆米花红。
// 主题：午夜蓝放映间 + 琥珀光。
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        round: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"PingFang SC"',
          '"HarmonyOS Sans SC"',
          '"Microsoft YaHei"',
          '"Segoe UI Rounded"',
          'system-ui',
          'sans-serif',
        ],
      },
      colors: {
        lumo: {
          amber: '#FFC02E',
          'amber-deep': '#F0A012',
          blue: '#2E6BE6',
          'blue-deep': '#1E3A7A',
          ground: '#101733', // 全站深底（放映间午夜蓝）
          card: '#1B274C', // 深底上的卡片/色块
          night: '#141A2E', // 播放器底 / 深色文字（偏蓝的炭黑）
          cream: '#FFF7EC', // 浅色面（家长设置、弹窗）
          paper: '#FFFFFF',
          sand: '#EFE6D6', // 浅色上的分隔线
          red: '#E8433B', // 爆米花红，仅用于告警/时间到
        },
        // ---- 旧 token 重新指向新配色，老 class 自动换肤 ----
        cream: '#FFF7EC',
        ink: '#141A2E',
        night: '#101733',
        candy: {
          coral: '#2E6BE6', // 主结构色（蓝）：按钮、链接，白字可用
          sky: '#3FA7F0',
          grass: '#37B58A',
          grape: '#7C5CE0',
          sun: '#FFC02E', // 琥珀：播放键、进度、发光，配深色字
          bubble: '#E8433B',
        },
        kid: {
          bg: '#101733',
          card: '#1B274C',
          primary: '#2E6BE6',
          accent: '#FFC02E',
          green: '#37B58A',
          purple: '#7C5CE0',
        },
      },
      borderRadius: {
        blob: '1.75rem',
        pill: '999px',
      },
      boxShadow: {
        toy: '0 10px 0 -2px rgba(4,8,22,0.28), 0 20px 34px -14px rgba(4,8,22,0.55)',
        toysm: '0 6px 0 -2px rgba(4,8,22,0.24), 0 14px 22px -12px rgba(4,8,22,0.5)',
        glow: '0 0 0 4px rgba(255,192,46,0.22), 0 10px 26px -8px rgba(255,192,46,0.4)',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '70%': { transform: 'scale(1.04)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bloom: {
          '0%': { transform: 'scale(0.4)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        pop: 'pop 260ms cubic-bezier(.34,1.56,.64,1) both',
        bloom: 'bloom 220ms cubic-bezier(.34,1.56,.64,1) both',
        wiggle: 'wiggle 500ms ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
