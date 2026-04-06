/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Monochrome brand — replaces purple entirely
        brand: {
          50:  '#f5f5f5',
          100: '#e8e8e8',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#737373',
          500: '#404040',
          600: '#111111',
          700: '#000000',
          800: '#000000',
          900: '#000000',
        },
        // Design token palette
        surface: '#F7F7F7',   // card backgrounds
        canvas:  '#EDEDED',   // page background
        line:    '#E2E2E2',   // borders
        ink:     '#111111',   // text primary
        dim:     '#6B6B6B',   // text secondary
        accent: {
          red:   '#FF3B3B',
          green: '#22C55E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-md': '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -1px rgb(0 0 0 / 0.04)',
      },
    },
  },
  plugins: [],
}
