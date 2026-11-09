/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a1622',
        navy: '#10314a',
        steel: '#1b4763',
        cyan: '#00a6e0',
        sun: '#ffc400',
        line: '#dce5ee',
        mutedink: '#5a7387',
      },
      boxShadow: {
        card: '0 2px 10px rgba(10, 22, 34, 0.06)',
      },
    },
  },
  plugins: [],
};
