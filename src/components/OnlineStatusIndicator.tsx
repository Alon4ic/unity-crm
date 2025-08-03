'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function OnlineStatusIndicator() {
    const t = useTranslations('status');
    const online = useOnlineStatus();
    const [mounted, setMounted] = useState(false);
    const [blinking, setBlinking] = useState(false);
    const [prevOnline, setPrevOnline] = useState(online);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        if (prevOnline !== online) {
            setBlinking(true);
            setTimeout(() => setBlinking(false), 1000);
            setPrevOnline(online);
        }
    }, [online, prevOnline, mounted]);

    if (!mounted) return null; // 💡 Предотвращаем SSR-гидрацию до монтирования

    return (
        <div className="fixed border top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-800 shadow-md">
            <span
                className={`h-4 w-4 rounded-full transition-colors ${
                    online ? 'bg-green-500' : 'bg-red-500'
                } ${blinking ? 'animate-ping' : ''}`}
                title={t(online ? 'online' : 'offline')}
            />
            <span className="text-sm text-gray-800 dark:text-gray-200">
                {t(online ? 'online' : 'offline')}
            </span>
        </div>
    );
}
