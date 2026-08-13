export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#143C5A',
        sea: '#0284C7',
        ocean: '#2563EB',
        mint: '#E9FFF7',
        lilac: '#EEF2FF',
        coral: '#F43F5E',
        paper: '#F6FAFF',
        warn: '#B45309',
      },
      boxShadow: {
        soft: '0 12px 32px rgba(15, 23, 42, 0.08)',
        glow: '0 16px 36px rgba(2, 132, 199, 0.22)',
      },
    },
  },
  plugins: [],
};
