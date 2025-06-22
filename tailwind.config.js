/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#121212',
          surface: '#1F1F1F',
          elevated: '#232323',
          border: '#2C2C2C',
          card: '#181A1B',
          accent: '#BB86FC',
          accent2: '#03DAC6',
          muted: '#A1A1AA',
          appleblue: '#007aff',
          applepurple: '#a259ff',
        },
        light: {
          bg: '#F8F9FA',
          surface: '#FFFFFF',
          border: '#E5E7EB',
          appleblue: '#007aff',
          applepurple: '#a259ff',
        },
        appleblue: '#007aff',
        applepurple: '#a259ff',
      },
    },
  },
  plugins: [],
};
