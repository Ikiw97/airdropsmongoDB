/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            colors: {
                // Custom background colors for main theme
                main: {
                    light: '#e0e5ec',
                    dark: '#1e293b', // slate-800
                },
                // Text colors
                text: {
                    light: '#374151', // gray-700
                    dark: '#e2e8f0', // slate-200
                }
            },
            boxShadow: {
                // Light Mode Shadows
                'neu-flat': '6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff',
                'neu-pressed': 'inset 6px 6px 12px #a3b1c6, inset -6px -6px 12px #ffffff',
                'neu-icon': '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff',
                'neu-icon-pressed': 'inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff',

                // Dark Mode Shadows (using darker shadows for depth and lighter reflections)
                // Dark Mode Shadows (using darker shadows for depth and lighter reflections)
                // Background assumed to be Slate-800 (#1e293b)
                'neu-flat-dark': '6px 6px 12px #0f172a, -6px -6px 12px rgba(255, 255, 255, 0.05)',
                'neu-pressed-dark': 'inset 6px 6px 12px #0f172a, inset -6px -6px 12px rgba(255, 255, 255, 0.05)',
                'neu-icon-dark': '4px 4px 8px #0f172a, -4px -4px 8px rgba(255, 255, 255, 0.05)',
                'neu-icon-pressed-dark': 'inset 4px 4px 8px #0f172a, inset -4px -4px 8px rgba(255, 255, 255, 0.05)',
            }
        },
    },
    plugins: [],
}
