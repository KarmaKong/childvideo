/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        round: ['"PingFang SC"', '"Nunito"', 'system-ui', 'sans-serif'],
      },
      colors: {
        kid: {
          bg: '#fff7ed',
          card: '#ffffff',
          primary: '#ff7a59',
          accent: '#4dabf7',
          green: '#51cf66',
          purple: '#9775fa',
        },
      },
      borderRadius: {
        blob: '2rem',
      },
    },
  },
  plugins: [],
}
