/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Accent color (purple)
        accent: {
          DEFAULT: "#a855f7", // purple-500
          light: "#c084fc", // purple-400
          dark: "#9333ea", // purple-600
        },
        // Use zinc for all grays
        background: {
          DEFAULT: "#18181b", // zinc-900 (dark mode)
          light: "#fafafa", // zinc-50 (light mode, not used but available)
          card: "#27272a", // zinc-800
          input: "#3f3f46", // zinc-700
        },
        text: {
          DEFAULT: "#fafafa", // zinc-50
          secondary: "#a1a1aa", // zinc-400
          muted: "#71717a", // zinc-500
        },
        border: {
          DEFAULT: "#3f3f46", // zinc-700
          light: "#52525b", // zinc-600
        },
      },
    },
  },
  plugins: [],
};
