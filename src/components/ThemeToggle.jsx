import React from 'react';
import { Moon, Sun, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            className="relative p-1.5 hover:text-white"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            initial={false}
            animate={{
                rotate: theme === 'dark' ? 0 : 180,
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
                    transition={{ duration: 0 }}
                >
                    <Moon size={22} className="text-neon-blue" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.5))' }} />
                </motion.div>

                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={false}
                    animate={{
                        scale: theme === 'dark' ? 0 : 1,
                        opacity: theme === 'dark' ? 0 : 1,
                    }}
                    transition={{ duration: 0 }}
                >
                    <Sun size={22} className="text-neon-green" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.5))' }} />
                </motion.div>
            </div>
        </motion.button>
    );
};

export default ThemeToggle;
