/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'body-bg': '#000b13',
        'primary-bg': '#11131d',
        'secondary-bg': '#191d28',
        'tertiary-bg': '#222933',
        'quaternary-bg': '#272e39',
        'transparent-bg': 'rgba(33, 36, 39, 0.789)',
      },
    },
  },
  plugins: [],
};
