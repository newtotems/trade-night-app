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
      },
      // Added animation and keyframes
      animation: {
        'loop-scroll': 'loop-scroll 50s linear infinite',
      },
      keyframes: {
        'loop-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [
    require('daisyui'), 
    require('preline/plugin'),
    // Removed existing plugins array
  ],
}