/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['DM Mono', 'JetBrains Mono', 'monospace'],
    },
    extend: {
      colors: {
        border: '#E6E2D8',
        input: '#E6E2D8',
        ring: '#1A1A2E',
        background: '#F5F3EF',
        foreground: '#1A1A1A',
        primary: {
          DEFAULT: '#1A1A2E',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#EDEAE2',
          foreground: '#8B8580',
        },
        muted: {
          DEFAULT: '#E6E2D8',
          foreground: '#A8A29E',
        },
        accent: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1A1A',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#16A34A',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1A1A',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      spacing: {
        '18': '4.5rem',
      },
      fontSize: {
        '2xs': '0.625rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
