export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#102033',
        sea: '#39B4F7',
        ocean: '#1179C9',
        mint: '#DDF6FF',
        lilac: '#EEF0FF',
        coral: '#FF7A59',
        paper: '#F7FBFF',
        warn: '#B45309',
      },
      boxShadow: {
        soft: '0 14px 36px rgba(25, 80, 130, 0.10)',
        glow: '0 18px 42px rgba(57, 180, 247, 0.28)',
      },
    },
  },
  plugins: [],
};
