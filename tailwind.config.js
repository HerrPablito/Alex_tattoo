/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-black': '#0a0a0a',
                'brand-dark': '#121212',
                'brand-gray': '#1e1e1e',
                'brand-gold': '#d4af37',
                'brand-white': '#f5f5f5',
            },
            fontFamily: {
                serif: ['"Montserrat"', 'sans-serif'], // Usign serif class for headings to map to Montserrat
                sans: ['"Inter"', 'sans-serif'],
            },
            letterSpacing: {
                tighter: '-0.04em', // custom tracking for that Gotham look
            },
        },
    },
    plugins: [],
}
