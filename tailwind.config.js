/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Nunito"', 'system-ui', 'sans-serif']
      },
      colors: {
        cream: '#FBF6EC',
        sand: '#F1E8D6',
        ink: '#2B2620',
        muted: '#7A6E5D',
        line: '#E6DCC6',
        // Kid palette
        coral: { 50: '#FFF1EC', 200: '#FFC8B3', 500: '#E26A4A', 700: '#9F3F22' },
        sage:  { 50: '#EEF4EC', 200: '#BFD6B8', 500: '#5E8A55', 700: '#365E2F' },
        plum:  { 50: '#F4EEF4', 200: '#D6BFD6', 500: '#8A578A', 700: '#5E305E' },
        butter:{ 50: '#FFF8E1', 200: '#F3DC8C', 500: '#C9A227', 700: '#7E6210' }
      },
      borderRadius: {
        card: '22px'
      },
      boxShadow: {
        card: '0 1px 0 #E6DCC6, 0 8px 24px -16px rgba(43,38,32,0.18)'
      }
    }
  },
  plugins: []
}
