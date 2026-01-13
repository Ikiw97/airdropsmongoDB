/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Coinglass Dark Theme
                crypto: {
                    dark: '#0d1117',
                    darker: '#010409',
                    card: '#161b22',
                    surface: '#1c2128',
                    border: 'rgba(240, 246, 252, 0.1)',
                },
                // Neon Accent Colors
                neon: {
                    green: '#00ff88',
                    greenLight: '#39ff14',
                    blue: '#0da5aa', // Updated to match user request (Teal)
                    blueLight: '#22d3ee',
                    purple: '#a855f7',
                    pink: '#ec4899',
                    violet: '#8b5cf6',
                    cyan: '#0da5aa', // Unified with blue
                },
                // Indicator Colors (Coinglass Style)
                indicator: {
                    green: '#00C087',
                    red: '#F6465D',
                    yellow: '#f0b90b',
                    blue: '#0da5aa', // Updated to match user request
                },
                // Legacy main colors (for compatibility)
                'main-light': '#e0e5ec',
                'main-dark': '#161b22',
                // GLOBAL OVERRIDE: Replace default blue with Teal
                blue: {
                    400: '#22d3ee',
                    500: '#0da5aa',
                    600: '#0b8c91',
                    700: '#0e7490',
                    DEFAULT: '#0da5aa',
                },
                // GLOBAL OVERRIDE: Also override cyan to match user's teal
                cyan: {
                    400: '#22d3ee',
                    500: '#0da5aa',
                    600: '#0b8c91',
                    700: '#0e7490',
                    DEFAULT: '#0da5aa',
                },
            },
            boxShadow: {
                'neon-green': '0 0 20px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 255, 136, 0.1)',
                'neon-blue': '0 0 20px rgba(13, 165, 170, 0.3), 0 0 40px rgba(13, 165, 170, 0.1)', // Updated Shadow
                'neon-purple': '0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.1)',
                'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
                'card': '0 4px 6px rgba(0, 0, 0, 0.3)',
                // Legacy neumorphic shadows (for compatibility)
                'neu-flat': '0 4px 6px rgba(0, 0, 0, 0.3)',
                'neu-flat-dark': '0 4px 6px rgba(0, 0, 0, 0.5)',
                'neu-pressed': 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                'neu-pressed-dark': 'inset 0 2px 4px rgba(0, 0, 0, 0.5)',
                'neu-icon': '0 0 20px rgba(0, 255, 136, 0.2)',
                'neu-icon-dark': '0 0 20px rgba(0, 255, 136, 0.2)',
            },
            animation: {
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'neon-border': 'neon-border 3s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                'glow-pulse': {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)' },
                    '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(0, 255, 136, 0.5)' },
                },
                'neon-border': {
                    '0%, 100%': { borderColor: 'rgba(0, 255, 136, 0.3)' },
                    '50%': { borderColor: 'rgba(0, 212, 255, 0.5)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
        },
    },
    plugins: [],
};
