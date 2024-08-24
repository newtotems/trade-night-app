/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./_site/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}