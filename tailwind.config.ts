/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: { 
        animation: {
            'slide-in': 'slide-in 0.3s ease-out forwards',
        },
        keyframes: {
            'slide-in': {
                '0%': { transform: 'translateX(100%)' },
                '100%': { transform: 'translateX(0)' },
            },
        },
        colors: {
            'bg-header': 'hsl(var(--bg-header))',
            background: 'hsl(var(--background))',
            foreground: 'hsl(var(--foreground))',
            primary: {
                DEFAULT: 'hsl(var(--primary))',
                foreground: 'hsl(var(--primary-foreground))',
            },
            place: 'hsl(var(--place))',
        },
        fontFamily: {
            roboto: ['"Roboto"', 'serif'],
            lato: ['"Lato"', 'serif'],
        },
        screens: {
            phone: '360px',
            sl: '460px',
            sm: '640px',
            md: '720px',
            middle: '850px',
            lg: '960px',
            laptop: '1150px',
            xl: '1200px',
            desktop: '1440px',
        },
    },
    
    plugins: [],
};
