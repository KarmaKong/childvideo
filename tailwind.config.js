/** @type {import('tailwindcss').Config} */
// LUMO Box —— 严格对齐品牌规范图。tokens 见 src/design/tokens.ts。
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        // LUMO 断点：<600 手机竖屏 / 600–900 平板竖屏 / >900 横屏·桌面
        pt: '600px', // 平板竖屏起
        ipad: '768px', // 竖屏 iPad
        nav: '900px', // 切到左侧导航条
        wide: '1200px',
      },
      fontFamily: {
        sans: [
          '"Nunito Variable"',
          'Nunito',
          '-apple-system',
          'BlinkMacSystemFont',
          '"PingFang SC"',
          '"HarmonyOS Sans SC"',
          '"Source Han Sans SC"',
          '"Noto Sans SC"',
          '"Microsoft YaHei"',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        label: ['11px', { lineHeight: '1.4', fontWeight: '500' }],
        caption: ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        body2: ['14px', { lineHeight: '1.55', fontWeight: '400' }],
        body: ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        card: ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'title-2': ['22px', { lineHeight: '1.3', fontWeight: '700' }],
        'title-1': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
      },
      colors: {
        lumo: {
          blue: '#3A7CFF',
          'blue-ink': '#2B62D9',
          yellow: '#FFC83D',
          'soft-blue': '#E8F2FF',
          coral: '#FF8A3D',
          green: '#48C47D',
          purple: '#A78DFA',
          paper: '#FFFFFF',
          page: '#F5F8FF',
          ink: '#232227',
          // 迁移期别名
          cocoa: '#232227',
          night: '#232227',
          cream: '#F5F8FF',
          mint: '#48C47D',
          red: '#FF6B6B',
          amber: '#FFC83D',
        },
        cream: '#F5F8FF',
        ink: '#232227',
        night: '#F5F8FF',
        candy: {
          coral: '#3A7CFF',
          sky: '#3A7CFF',
          grass: '#48C47D',
          grape: '#A78DFA',
          sun: '#FFC83D',
          bubble: '#FF8A3D',
        },
        kid: {
          bg: '#F5F8FF',
          card: '#FFFFFF',
          primary: '#3A7CFF',
          accent: '#FFC83D',
          green: '#48C47D',
          purple: '#A78DFA',
        },
      },
      borderRadius: {
        sm: '12px',
        md: '16px',
        card: '20px',
        video: '22px',
        panel: '24px',
        hero: '28px',
        blob: '20px',
        pill: '999px',
      },
      boxShadow: {
        sm: '0 4px 12px rgba(35,75,120,0.06)',
        md: '0 8px 24px rgba(35,75,120,0.08)',
        floating: '0 16px 40px rgba(35,75,120,0.12)',
        toy: '0 16px 40px rgba(35,75,120,0.12)',
        toysm: '0 8px 24px rgba(35,75,120,0.08)',
        glow: '0 0 0 4px rgba(255,200,61,0.30)',
      },
      transitionTimingFunction: { lumo: 'cubic-bezier(0.22, 0.61, 0.36, 1)' },
      keyframes: {
        'lumo-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.02)' } },
        blink: {
          '0%,92%,100%': { transform: 'scaleY(1)' },
          '96%': { transform: 'scaleY(0.1)' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bloom: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: { '0%,100%': { transform: 'rotate(-2deg)' }, '50%': { transform: 'rotate(2deg)' } },
      },
      animation: {
        'lumo-in': 'lumo-in 300ms cubic-bezier(0.22,0.61,0.36,1) both',
        breathe: 'breathe 4s ease-in-out infinite',
        blink: 'blink 5s ease-in-out infinite',
        pop: 'lumo-in 260ms cubic-bezier(0.22,0.61,0.36,1) both',
        bloom: 'bloom 200ms cubic-bezier(0.22,0.61,0.36,1) both',
        wiggle: 'wiggle 600ms ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
