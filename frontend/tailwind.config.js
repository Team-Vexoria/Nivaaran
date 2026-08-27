/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nivaaran-bg': '#FAF8F3',
        'nivaaran-surface': '#F3F0E8',
        'nivaaran-muted': '#EAE6DA',
        'nivaaran-primary': {
          DEFAULT: '#1E3A5F',
          hover: '#16293F',
        },
        'nivaaran-secondary': '#0F766E',
        'nivaaran-accent': '#C2760C',
        'nivaaran-danger': '#B3261E',
        'nivaaran-warning': '#B45309',
        'nivaaran-text': {
          primary: '#22201B',
          secondary: '#5C574C',
        },
        'nivaaran-border': '#DCD6C6',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
