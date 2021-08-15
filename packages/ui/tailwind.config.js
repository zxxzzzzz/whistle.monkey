module.exports = {
  purge: {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],

    // These options are passed through directly to PurgeCSS
    options: {
      safelist: [/^text-pink/, /^text-purple/],
    }
  },
  important:true,
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
