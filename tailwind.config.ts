import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F6F4EF",
        "paper-raised": "#FCFBF8",
        ink: {
          DEFAULT: "#1C231F",
          soft: "#4B564E",
          faint: "#8B9289",
        },
        line: "#DEDAD0",
        gain: {
          DEFAULT: "#2F6B4F",
          soft: "#E7EFE9",
        },
        loss: {
          DEFAULT: "#A6402A",
          soft: "#F5E7E2",
        },
        brass: {
          DEFAULT: "#A9822F",
          soft: "#F1E9D4",
        },
      },
      fontFamily: {
        display: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        lg: "10px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(28, 35, 31, 0.06), 0 1px 0 rgba(28,35,31,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
