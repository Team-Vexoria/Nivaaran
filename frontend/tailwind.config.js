/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nivaaran-primary': {
          DEFAULT: '#1E3A5F',
          hover: '#16293F',
        },
        'nivaaran-secondary': '#0F766E',
        'nivaaran-accent': '#C2760C',
        'nivaaran-danger': '#B3261E',
        'nivaaran-warning': '#B45309',
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
