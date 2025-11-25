/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#0F4C81',
        secondary: '#FF6F00',
        background: '#FFFFFF',
        textPrimary: '#0B2545',
        textSecondary: '#5B6B7A',
        success: '#2E7D32',
        error: '#D32F2F',
        disabled: '#E6EEF8'
      }
    },
  },
  plugins: [],
}