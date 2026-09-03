/** @type {import('tailwindcss').Config} */
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
        cream: '#FFF6E9',
        ink: '#3A2E28',
        candy: {
          coral: '#FF7A59',
          sky: '#3FB9E8',
          grass: '#4BC673',
          grape: '#9B7BF0',
          sun: '#FFC23C',
          bubble: '#FF7FB0',
        },
        // 兼容旧引用
        kid: {
          bg: '#FFF6E9',
          card: '#ffffff',
          primary: '#FF7A59',
          accent: '#3FB9E8',
          green: '#4BC673',
          purple: '#9B7BF0',
        },
      },
      borderRadius: {
        blob: '1.75rem',
        pill: '999px',
      },
      boxShadow: {
        toy: '0 10px 0 -2px rgba(58,46,40,0.12), 0 18px 30px -12px rgba(58,46,40,0.28)',
        toysm: '0 6px 0 -2px rgba(58,46,40,0.12), 0 12px 20px -10px rgba(58,46,40,0.28)',
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
