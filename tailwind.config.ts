import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'sys-base': '#1A1025',
        'sys-dark-violet': '#2D1B4E',
        'sys-violet': '#6B38FB',
        'sys-lavender': '#A585FF',
        'sys-pink': '#FF2E93',
        'sys-pale-pink': '#FFB8D8',
        'sys-line': '#0D0814',
        'sys-white': '#F8F5F2',
      },
      fontFamily: {
        display: ['var(--font-silkscreen)', 'cursive'],
        mono: ['var(--font-space-mono)', 'monospace'],
        body: ['var(--font-atkinson)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
