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
        navy: {
          950: "#060911",
          900: "#0B0F19",
          850: "#101726",
          800: "#161F30",
          750: "#1A253A",
          700: "#222F46",
          600: "#31415E",
        },
        primary: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        violet: {
          electric: "#7C3AED",
          soft: "#8B5CF6",
          glow: "#A78BFA",
        },
        teal: {
          electric: "#0D9488",
          neon: "#14B8A6",
          soft: "#2DD4BF",
        },
        weak: "#F43F5E",
        medium: "#F59E0B",
        strong: "#10B981",
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(99, 102, 241, 0.25)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
