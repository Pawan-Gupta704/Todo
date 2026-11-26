/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--primary) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        bg: "rgb(var(--bg) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        txt: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--border) / <alpha-value>)",
        tintIndigo: "#eef2ff",
        tintMint: "#ecfdf5",
        tintPeach: "#fff7ed",
        tintRose: "#fef2f2",
        tintPink: "#fdf2f8",
        tintSky: "#eff6ff",
        tintAmber: "#fffbeb",
        tintSlate: "#f1f5f9",
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(30,64,175,0.04), 0 2px 8px rgba(30,64,175,0.04)",
        lift: "0 4px 12px rgba(30,64,175,0.07), 0 12px 32px rgba(30,64,175,0.08)",
        glow: "0 0 0 1px rgba(37,99,235,0.1), 0 8px 24px rgba(37,99,235,0.18)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
