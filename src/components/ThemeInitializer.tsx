'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function ThemeInitializer() {
    const { setTheme } = useTheme();

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, [setTheme]);

    return null;
}
