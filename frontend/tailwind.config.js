/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        ink: "#121826",
        paper: "#F3F7F3",
        forest: {
          DEFAULT: "#0F6B4C",
          dark: "#0B4F39",
          light: "#1B8F63",
        },
        gold: {
          DEFAULT: "#D9A441",
          light: "#F0C878",
        },
        line: "#DCE6DF",
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(18,24,38,0.04), 0 8px 24px -12px rgba(18,24,38,0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
