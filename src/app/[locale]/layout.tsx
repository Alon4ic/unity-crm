import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from 'next-themes';
import '../globals.css';
import { Header } from '@/components/Header';
import ThemeInitializer from '@/components/ThemeInitializer';
import { ReactNode } from 'react';
import { LoginModal } from '@/components/form/LoginModal';
import { Toaster } from 'react-hot-toast';
import ProductDragProvider from '@/components/providers/ProductDragProvider'; // 👈 импортируем провайдер

// Генерация статических параметров для локалей
export async function generateStaticParams() {
    return [{ locale: 'ru' }, { locale: 'ua' }, { locale: 'en' }];
}

// Типизация props для layout
interface LocaleLayoutProps {
    children: ReactNode;
    params: Promise<{ locale: string }>; // params теперь Promise
}

export default async function LocaleLayout({
    children,
    params,
}: LocaleLayoutProps) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    return (
        <html lang={locale} suppressHydrationWarning>
            <body>
                <ThemeProvider attribute="class" defaultTheme="light">
                    <ThemeInitializer />
                    <NextIntlClientProvider locale={locale}>
                        <ProductDragProvider>
                            {' '}
                            {/* 👈 оборачиваем всё приложение */}
                            <LoginModal />
                            <Header />
                            {children}
                            <Toaster
                                position="top-right"
                                reverseOrder={false}
                            />
                        </ProductDragProvider>
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
