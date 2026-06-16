/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/**/*.html"],
  theme: {
    extend: {
      fontFamily: {
        sans:  ["Space Grotesk", "system-ui", "sans-serif"],
        serif: ["EB Garamond", "Georgia", "serif"],
        mono:  ["Space Mono", "ui-monospace", "monospace"],
      },
      colors: {
        ink:     "#1A1D23",
        muted:   "#6B7280",
        faint:   "#9CA3AF",
        divider: "#E2E6EB",
        surface: "#F8FAFB",
        accent:  "#2D4A7A",
        gold:    "#B8811F",
      },
    },
  },
  plugins: [],
};
