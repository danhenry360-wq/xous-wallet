/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        ink: {
          900: "#0a0b0f",
          800: "#0f1117",
          700: "#161922",
          600: "#1d212c",
          500: "#262b38",
        },
        accent: {
          DEFAULT: "#6d5efc",
          glow: "#8b7bff",
        },
        money: {
          up: "#2ebd85",
          down: "#f6465d",
        },
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 50px -20px rgba(0,0,0,0.7)",
        glow: "0 0 40px -8px rgba(109,94,252,0.55)",
      },
      backgroundImage: {
        "accent-grad": "linear-gradient(135deg, #6d5efc 0%, #8b7bff 50%, #a78bfa 100%)",
        "card-grad": "linear-gradient(160deg, rgba(109,94,252,0.14) 0%, rgba(109,94,252,0.02) 45%, rgba(255,255,255,0.01) 100%)",
      },
    },
  },
  plugins: [],
};
