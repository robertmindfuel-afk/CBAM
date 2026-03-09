/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: { 0:'#f6f3ee', card:'#fefdfb', warm:'#f0ece4', cream:'#eae5db', sand:'#dfd8cb', hover:'#ece8e0' },
        ink: { DEFAULT:'#1a1714', 2:'#4a4439', 3:'#7a7265', 4:'#a59d90', 5:'#c4bdb2' },
        olive: { DEFAULT:'#4a6741', soft:'rgba(74,103,65,0.08)', med:'rgba(74,103,65,0.14)', ring:'rgba(74,103,65,0.18)' },
        clay: { DEFAULT:'#b5704d', soft:'rgba(181,112,77,0.08)' },
        slate: { DEFAULT:'#5c6b7e', soft:'rgba(92,107,126,0.08)' },
        plum: { DEFAULT:'#7d5a82', soft:'rgba(125,90,130,0.08)' },
        ochre: { DEFAULT:'#a68a3e', soft:'rgba(166,138,62,0.08)' },
        rose: { DEFAULT:'#b35d5d', soft:'rgba(179,93,93,0.08)' },
      },
      fontFamily: {
        sans: ['Instrument Sans', 'system-ui', 'sans-serif'],
        serif: ['Literata', 'Georgia', 'serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
