/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        editor: {
          bg: "#1e1e1e",
          sidebar: "#252526",
          active: "#37373d",
          border: "#3e3e42",
        },
      },
    },
  },
  plugins: [],
}
