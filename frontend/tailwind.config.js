/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: '#FAF8F4',
        charcoal: '#201C18',
        espresso: '#211D19',
        forest: {
          DEFAULT: '#2C6E49',
          hover: '#23583a',
        },
        ochre: {
          DEFAULT: '#C98A2C',
          hover: '#b07722',
        },
        terracotta: {
          DEFAULT: '#B5502D',
          hover: '#9c4323',
        },
        sand: '#E4DDD1',
        'nivaaran-primary': {
          DEFAULT: '#2C6E49',
          hover: '#23583a',
        },
        'nivaaran-secondary': '#C98A2C',
        'nivaaran-accent': '#B5502D',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
