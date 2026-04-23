/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'manutencao-blue': '#1e40af', // Um azul industrial sério
      }
    },
  },
  plugins: [],
}