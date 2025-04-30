'use client';

import { usePathname, useRouter } from 'next/navigation';

interface Props {
    className?: string;
    onChangeCallback?: () => void;
}

export default function LanguageSelect({
    className = '',
    onChangeCallback,
}: Props) {
    const pathname = usePathname();
    const router = useRouter();

    const currentLocale = pathname.split('/')[1] || 'ru';

    const changeLocale = (newLocale: string) => {
        const newPath = `/${newLocale}${pathname.replace(/^\/[a-z]{2}/, '')}`;
        router.push(newPath);
        if (onChangeCallback) onChangeCallback(); // нужно, чтобы закрывать меню
    };

    return (
        <select
            value={currentLocale}
            onChange={(e) => changeLocale(e.target.value)}
            className={`bg-transparent border px-2 py-1 rounded text-sm ${className}`}
        >
            <option value="ru">🇷🇺 Рус</option>
            <option value="ua">🇺🇦 Укр</option>
            <option value="en">🇬🇧 Eng</option>
        </select>
    );
}
