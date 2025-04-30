'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // 1. Проверяем монтирование компонента
    useEffect(() => setMounted(true), []);

    // 2. Синхронизация с localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) setTheme(savedTheme);
        }
    }, [setTheme]);

    if (!mounted) return null;

    return (
        <button
            onClick={() => {
                const newTheme = theme === 'dark' ? 'light' : 'dark';
                setTheme(newTheme);
                localStorage.setItem('theme', newTheme);
            }}
            className="py-[3px] px-2 border w-[50px] rounded text-sm"
        >
            {theme === 'dark' ? '🌙' : '☀️'}
        </button>
    );
};
