/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand — finance green (growth, money, trust)
        brand: {
          50:  '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        // Navy dark palette
        surface: '#0F2743',
        canvas:  '#0A1929',
        line:    '#1B3F6E',
        ink:     '#E8F4FF',
        dim:     '#7B9CBE',
        accent: {
          red:    '#EF4444',
          green:  '#22C55E',
          blue:   '#38BDF8',
          purple: '#A78BFA',  // soft — secondary only
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card':       '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
        'card-md':    '0 4px 24px 0 rgb(0 0 0 / 0.5), 0 2px 8px -1px rgb(0 0 0 / 0.35)',
        'glow-sm':    '0 0 16px rgba(34, 197, 94, 0.18)',
        'glow-md':    '0 0 32px rgba(34, 197, 94, 0.25)',
        'glow-blue':  '0 0 16px rgba(56, 189, 248, 0.18)',
      },
    },
  },
  plugins: [],
}
