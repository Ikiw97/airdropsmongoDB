import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            className={`relative p-2 rounded-xl transition-all duration-300 ${theme === 'dark'
                ? 'bg-gray-800 shadow-[4px_4px_8px_#111827,-4px_-4px_8px_#374151] text-amber-400'
                : 'bg-[#e0e5ec] shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff] text-amber-500'
                }`}
            whileTap={{ scale: 0.95 }}
            initial={false}
            animate={{
                rotate: theme === 'dark' ? 180 : 0,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <div className="relative w-6 h-6">
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={false}
                    animate={{
                        scale: theme === 'dark' ? 1 : 0,
                        opacity: theme === 'dark' ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                >
                    <Moon size={24} fill="currentColor" className="text-blue-200" />
                </motion.div>

                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={false}
                    animate={{
                        scale: theme === 'dark' ? 0 : 1,
                        opacity: theme === 'dark' ? 0 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                >
                    <Sun size={24} fill="currentColor" className="text-amber-500" />
                </motion.div>
            </div>
        </motion.button>
    );
};

export default ThemeToggle;
