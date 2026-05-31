import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        descubra: {
          navy: '#1B365D',
          royal: '#0056B3',
          orange: '#F26522',
          green: '#00A859',
        },
        indigo: {
          50: '#e6f0fa',
          100: '#dbe5f0',
          200: '#bcd0e6',
          300: '#8eafd6',
          400: '#5987c0',
          500: '#0056B3',
          600: '#0056B3',
          700: '#1B365D',
          800: '#122542',
          900: '#0b1626',
          950: '#060d17',
        },
        violet: {
          50: '#e6f0fa',
          100: '#dbe5f0',
          200: '#bcd0e6',
          300: '#8eafd6',
          400: '#5987c0',
          500: '#0056B3',
          600: '#0056B3',
          700: '#1B365D',
          800: '#122542',
          900: '#0b1626',
          950: '#060d17',
        },
        emerald: {
          50: '#e6f6ee',
          100: '#cceee0',
          200: '#99dcc0',
          300: '#66cfa1',
          400: '#33c182',
          500: '#00A859',
          600: '#008a49',
          700: '#006d3a',
          800: '#004f2a',
          900: '#00311a',
          950: '#00190d',
        },
        amber: {
          50: '#fef0e9',
          100: '#fddbc9',
          200: '#fbb794',
          300: '#f8935c',
          400: '#f5702d',
          500: '#F26522',
          600: '#d94d0e',
          700: '#b4390b',
          800: '#8f2b08',
          900: '#6a1d04',
          950: '#451001',
        }
      }
    },
  },
  plugins: [],
};
export default config;
