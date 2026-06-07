/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0f1117',
          secondary: '#161b22',
          tertiary: '#21262d',
        },
        accent: {
          blue: '#378ADD',
        },
        status: {
          online: '#3fb950',
          offline: '#f85149',
          warning: '#d29922',
        },
      },
      fontSize: {
        '2xs': '11px',
        xs: '12px',
        sm: '13px',
        base: '14px',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.1)',
      },
    },
  },
  plugins: [],
}
