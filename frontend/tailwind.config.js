export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#122033',
        sea: '#2563EB',
        ocean: '#1D4ED8',
        mint: '#ECFDF5',
        lilac: '#F3F0FF',
        coral: '#F97316',
        paper: '#F8FAFC',
        warn: '#B45309',
      },
      boxShadow: {
        soft: '0 12px 32px rgba(15, 23, 42, 0.08)',
        glow: '0 16px 36px rgba(37, 99, 235, 0.22)',
      },
    },
  },
  plugins: [],
};
