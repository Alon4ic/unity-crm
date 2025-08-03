'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Navigation = () => {
    const t = useTranslations('Nav');
    const pathname = usePathname();

    const menuItems = [
        { label: t('home'), href: '/' },
        { label: t('dashboard'), href: '/dashboard' },
        { label: t('sales'), href: '/sales' },
        { label: t('statistics'), href: '/statistics' },
    ];

    return (
        <nav>
            <ul className="flex xl:gap-8 gap-4 laptop:text-base text-sm font-semibold tracking-wide">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`transition-all duration-300 text-lg px-2 py-1 rounded-md ${
                                    isActive
                                        ? 'text-[hsl(var(--primary))] border-b-2 border-[hsl(var(--primary))]'
                                        : 'text-muted-foreground hover:text-[hsl(var(--primary))] hover:border-b hover:border-muted'
                                }`}
                            >
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};
