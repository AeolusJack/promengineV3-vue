/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#F8F9FA',
        'text-primary': '#1E1F22',
        'text-secondary': '#6B7280',
        'border-light': '#E5E7EB',
        'hover-bg': '#F3F4F6',
      },
      borderRadius: {
        'card': '8px',
        'button': '8px',
        'tag': '4px',
        'modal': '12px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
}