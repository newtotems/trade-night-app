/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./content/**/*.{html,js,njk,md}",
    "./_includes/**/*.{html,js,njk,md}",
    "./_layouts/**/*.{html,js,njk,md}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('daisyui'), 
  ],
}