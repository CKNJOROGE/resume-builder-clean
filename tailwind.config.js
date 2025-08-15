// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      backdropBlur: {
        xs: '2px',    // new super‐light blur
        md: '6px',    // override default medium blur
        '4xl': '60px' // optional heavy blur
      },
    },
  },
  plugins: [],
}
