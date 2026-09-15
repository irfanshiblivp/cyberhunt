/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#080b12',
          800: '#0e1424',
          700: '#172038',
          600: '#233052',
        },
        cyber: {
          cyan: '#00f3ff',
          neon: '#39ff14',
          yellow: '#ffe600',
          red: '#ff0055',
          purple: '#9d00ff',
        },
        among: {
          cyan: '#38fedc',
          red: '#c51111',
          blue: '#132ed1',
          green: '#127f2d',
          pink: '#ed54ba',
          orange: '#ef7d0d',
          yellow: '#f5f557',
          black: '#3f474e',
          white: '#d6e0f0',
          purple: '#6b2fbb',
          brown: '#71491e',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
