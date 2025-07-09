/** @type {import('tailwindcss').Config} */
import flowbite from 'flowbite-react/tailwind'
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content()],
  theme: {
    extend: {
      maxWidth: {
        'container': '1200px' // max width of the page container
      },
      padding: { // padding for the container
        'container-px': '1rem',
        'container-px-md': '1.5rem'
      },
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',
        complementPrimary: 'var(--complement-primary)',
        complementSecondary: 'var(--complement-secondary)',
        accent1: 'var(--accent-1)',
        accent2: 'var(--accent-2)',
        highlight: 'var(--highlight)',
        navbar: 'var(--navbar)'
      },
      fontFamily: {
        dancingScript: ['Dancing Script', 'cursive'],
        libreBaskerville: ['Libre Baskerville', 'serif'],
        playfair: ['Playfair Display', 'serif'],
        dmSans: ['DM Sans', 'sans-serif'],
        inter: ['Inter', 'sans-serif'], // Add Inter font
      },
    },
  },
  plugins: [
    flowbite.plugin()
  ],
};
