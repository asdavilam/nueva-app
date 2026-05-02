import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B1020",
        panel: "#10182b",
        panelSoft: "#141f36",
        accent: "#F97316",
        success: "#22C55E",
        warning: "#F59E0B",
        muted: "#94A3B8"
      }
    }
  },
  plugins: []
};

export default config;
