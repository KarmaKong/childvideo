/** @type {import('tailwindcss').Config} */
// LUMO Box Design System —— tokens 见 src/design/tokens.ts，此处为 Tailwind 镜像。
// 「孩子自己的小小放映厅」：round / soft / bright / spacious / calm。
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Nunito Variable"',
          'Nunito',
          '-apple-system',
          'BlinkMacSystemFont',
          '"PingFang SC"',
          '"HarmonyOS Sans SC"',
          '"Noto Sans SC"',
          '"Microsoft YaHei"',
          'system-ui',
          'sans-serif',
        ],
        round: [
          '"Nunito Variable"',
          'Nunito',
          '-apple-system',
          'BlinkMacSystemFont',
          '"PingFang SC"',
          '"HarmonyOS Sans SC"',
          '"Noto Sans SC"',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        caption: ['14px', { lineHeight: '1.5', fontWeight: '500' }],
        body: ['16px', { lineHeight: '1.6', fontWeight: '500' }],
        card: ['17px', { lineHeight: '1.4', fontWeight: '600' }],
        'card-lg': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        section: ['21px', { lineHeight: '1.3', fontWeight: '700' }],
        'page-title': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        display: ['32px', { lineHeight: '1.15', fontWeight: '700' }],
      },
      colors: {
        lumo: {
          blue: '#2F8CF4',
          'blue-ink': '#1F6FD0',
          yellow: '#FFC541',
          cream: '#FFF9ED',
          paper: '#FFFFFF',
          'soft-blue': '#DCEFFF',
          cocoa: '#211A16',
          coral: '#FF8748',
          mint: '#84D7BD',
          red: '#EF5B52',
          // 迁移期别名（旧页面还在用，STEP 5–7 会清掉）
          night: '#211A16',
          ink: '#211A16',
          amber: '#FFC541',
        },
        // ---- 旧 token 重新指向 LUMO，老 class 自动换肤，页面逐步迁移 ----
        cream: '#FFF9ED',
        ink: '#211A16',
        night: '#FFF9ED',
        candy: {
          coral: '#2F8CF4',
          sky: '#2F8CF4',
          grass: '#84D7BD',
          grape: '#FF8748',
          sun: '#FFC541',
          bubble: '#FF8748',
        },
        kid: {
          bg: '#FFF9ED',
          card: '#FFFFFF',
          primary: '#2F8CF4',
          accent: '#FFC541',
          green: '#84D7BD',
          purple: '#FF8748',
        },
      },
      borderRadius: {
        sm: '12px',
        md: '16px',
        card: '20px',
        video: '24px',
        panel: '28px',
        hero: '32px',
        blob: '24px', // 旧别名 → video
        pill: '999px',
      },
      boxShadow: {
        sm: '0 4px 12px rgba(35,75,120,0.06)',
        md: '0 8px 24px rgba(35,75,120,0.08)',
        floating: '0 12px 32px rgba(35,75,120,0.10)',
        // 旧别名
        toy: '0 12px 32px rgba(35,75,120,0.10)',
        toysm: '0 8px 24px rgba(35,75,120,0.08)',
        glow: '0 0 0 4px rgba(255,197,65,0.28)',
      },
      transitionTimingFunction: {
        lumo: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      keyframes: {
        'lumo-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%,100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        blink: {
          '0%,92%,100%': { transform: 'scaleY(1)' },
          '96%': { transform: 'scaleY(0.1)' },
        },
        // 旧别名保留（页面迁移前不炸）
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
