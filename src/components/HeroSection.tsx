'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
    return (
        <section className="w-full px-6 py-12 md:py-20 bg-white dark:bg-black transition-colors">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                {/* Картинка */}
                <div className="flex justify-center">
                    <Image
                        src="/images/crm.png" // замените на свой путь
                        alt="CRM Illustration"
                        width={500}
                        height={500}
                        className="w-full max-w-md md:max-w-lg h-auto"
                        priority
                    />
                </div>

                {/* Текстовый блок */}
                <div className="text-center md:text-left space-y-6">
                    <h1 className="font-playfair text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Мощная CRM для вашего бизнеса
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
                        Управляйте клиентами, продажами и аналитикой в одном
                        интуитивном интерфейсе.
                    </p>
                    <div>
                        <Link
                            href="/signup"
                            className="inline-block px-6 py-3 text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-lg text-base font-medium transition-colors shadow-lg dark:shadow-none"
                        >
                            Тестировать CRM
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
