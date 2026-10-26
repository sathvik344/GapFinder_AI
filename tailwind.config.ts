import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Warm ivory / parchment palette
        ivory: {
          50: "#FAF8F3",
          100: "#F5F1E8",
          150: "#EFE9DC",
          200: "#E8E0CE",
          300: "#DDD2BC",
          400: "#C4B69B",
          500: "#A89879",
          900: "#241F17",
        },
        // Deep forest green typography & primary brand
        forest: {
          50: "#F0F7F4",
          100: "#DCEEE7",
          200: "#BBDDD0",
          300: "#8DC5B3",
          400: "#5BA892",
          500: "#368A73",
          600: "#276E5B",
          700: "#20594A",
          800: "#1A463B",
          850: "#13372E",
          900: "#0E2922",
          950: "#071713",
        },
        // Coral-red action buttons & urgent alerts
        coral: {
          50: "#FFF5F3",
          100: "#FEEAE6",
          200: "#FDD9D2",
          300: "#F9BDB1",
          400: "#F28C7A",
          500: "#E0533C",
          600: "#C8402A",
          700: "#A63320",
          800: "#892C1D",
          900: "#71281D",
        },
        // Nocturnal Forest (for dark mode backgrounds)
        pine: {
          950: "#060E0C",
          900: "#0A1714",
          850: "#0F201C",
          800: "#152A25",
          750: "#1B352F",
          700: "#24443C",
          600: "#345C52",
        },
        // Diagnostic status aliases
        weak: "#E0533C",
        medium: "#D97706",
        strong: "#168B5C",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", '"Times New Roman"', "Times", "serif"],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: ['"SF Mono"', "Menlo", "Monaco", "Consolas", '"Liberation Mono"', '"Courier New"', "monospace"],
      },
      boxShadow: {
        paper: "0 1px 3px 0 rgba(14, 41, 34, 0.05), 0 1px 2px -1px rgba(14, 41, 34, 0.05)",
        card: "0 2px 6px -1px rgba(14, 41, 34, 0.06), 0 1px 3px -1px rgba(14, 41, 34, 0.04)",
        coral: "0 4px 14px 0 rgba(224, 83, 60, 0.28)",
        forest: "0 4px 14px 0 rgba(14, 41, 34, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
