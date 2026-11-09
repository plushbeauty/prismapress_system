/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0A1622",
        navy: {
          900: "#0A2E4C",
          800: "#0D3B5C",
          700: "#12466B",
          DEFAULT: "#10314A",
        },
        steel: "#1B4763",
        brand: {
          blue: "#1E88E7",
          sky: "#48B7C7",
          cyan: "#35B6E9",
          orange: "#F7941D",
          amber: "#FDB913",
          green: "#22A55B",
          pink: "#EC4899",
          purple: "#9333EA",
        },
        cyan: "#00A6E0",
        sun: "#FFC400",
        surface: "#F1F6FC",
        line: "#DCE5EE",
        mutedink: "#5A7387",
      },
      boxShadow: {
        card: "0 6px 24px -8px rgba(13, 59, 92, 0.14)",
        soft: "0 2px 12px rgba(13, 59, 92, 0.08)",
      },
    },
  },
  plugins: [],
};
