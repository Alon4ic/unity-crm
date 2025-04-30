'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from './ui/ThemeToggle';
import LanguageSelect from './LanguageSelect';
import { Logo } from './Logo';
import { X } from 'lucide-react';

interface Props {
    open: boolean;
    setOpen: (value: boolean) => void;
    currentLocale: string;
    changeLocale: (locale: string) => void;
}

export default function MobileMenu({
    open,
    setOpen,
}: Props) {
    const t = useTranslations('Header');

    const menuItems = [
        { label: t('home'), href: '/' },
        { label: t('features'), href: '/features' },
        { label: t('pricing'), href: '/pricing' },
        { label: t('download'), href: '/download' },
        { label: t('contacts'), href: '/contacts' },
    ];

    // Запрет прокрутки при открытом меню
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
    }, [open]);

    if (!open) return null;

    return (
        <>
            {/* Затемнение фона */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setOpen(false)}
            />

            {/* Само меню */}
            <div className="lg:hidden absolute top-0 left-0 w-full bg-white dark:bg-black flex flex-col items-center gap-4 py-6 z-50">
                <div className="w-full flex justify-between items-center px-5">
                    <Logo />
                    <X size={24} onClick={() => setOpen(false)}  />
                </div>
                {menuItems.map(({ label, href }) => (
                    <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className="text-lg font-medium hover:text-primary transition"
                    >
                        {label}
                    </Link>
                ))}

                <LanguageSelect
                    className="w-[90px] text-center"
                    onChangeCallback={() => setOpen(false)}
                />

                <ThemeToggle />

                <Link
                    href="/signup"
                    className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:opacity-90 text-center"
                    onClick={() => setOpen(false)}
                >
                    {t('start')}
                </Link>
            </div>
        </>
    );
}
