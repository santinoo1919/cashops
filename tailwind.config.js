/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'ios-blue': '#007AFF',
        'ios-blue-light': '#E3F2FD',
        'ios-blue-dark': '#0051D5',
      },
    },
  },
  plugins: [],
};
