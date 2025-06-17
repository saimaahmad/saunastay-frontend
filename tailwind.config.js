/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        beige: '#F1EBD6',
        forest: '#228B22',
        gold: '#FFD700',
        brown: '#A0522D',
      },
      backgroundImage: {
        'sauna-header': "url('/sauna-header.jpg')",
      }
    },
  },
  plugins:  [
    require('tailwind-scrollbar-hide'),
  ],
  
};

  