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
        border: '#EBEBEB',
        input: '#EBEBEB',
        ring: '#0A0A0A',
        background: '#FFFFFF',
        foreground: '#0A0A0A',
        primary: {
          DEFAULT: '#0A0A0A',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F5F5F5',
          foreground: '#0A0A0A',
        },
        muted: {
          DEFAULT: '#F9F9F9',
          foreground: '#9E9E9E',
        },
        accent: {
          DEFAULT: '#F5F5F5',
          foreground: '#0A0A0A',
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
          foreground: '#0A0A0A',
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
