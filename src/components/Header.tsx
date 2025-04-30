'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './ui/ThemeToggle';
import { Navigation } from './Navigation';
import MobileMenu from './MobileMenu';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from './Logo';
import LanguageSelect from './LanguageSelect';
import { useModalStore } from '@/store/modal';


export const Header = () => {
    const t = useTranslations('Header');
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const { open } = useModalStore();

    const currentLocale = pathname.split('/')[1] || 'ru';

    const changeLocale = (newLocale: string) => {
        const newPath = `/${newLocale}${pathname.replace(/^\/[a-z]{2}/, '')}`;
        router.push(newPath);
    };

    return (
        <header className="font-playfair w-full px-6 py-4 shadow-sm backdrop-blur-md bg-background sticky top-0 z-50 transition-colors border-b border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center max-w-screen-xl mx-auto">
                <Logo />

                {/* Десктоп меню */}
                <div className="hidden lg:flex xl:gap-8 gap-4 items-center">
                    <Navigation />
                    <LanguageSelect />
                    <ThemeToggle />
                    <button
                        onClick={() => open('login')}
                        className="border border-primary text-primary hover:bg-primary hover:text-white transition-colors px-4 py-1 rounded text-sm font-medium"
                    >
                        {t('login')}
                    </button>
                    <button
                        onClick={() => open('signup')}
                        className="bg-primary text-white hover:bg-opacity-90 transition-colors px-4 py-1 rounded text-sm font-medium"
                    >
                        {t('register')}
                    </button>
                </div>

                {/* Кнопка открытия мобильного меню */}
                <div className="lg:hidden flex items-center gap-2">
                    <button
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="text-gray-800 dark:text-gray-100"
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Мобильное меню */}
            <MobileMenu
                open={menuOpen}
                setOpen={setMenuOpen}
                currentLocale={currentLocale}
                changeLocale={changeLocale}
            />
        </header>
    );
};
