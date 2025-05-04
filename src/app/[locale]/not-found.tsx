// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6">
            <h1 className="text-4xl font-bold mb-4">Страница не найдена</h1>
            <p className="text-lg mb-6 text-gray-500 dark:text-gray-400">
                К сожалению, такой страницы не существует.
            </p>
            <Link
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Вернуться на главную
            </Link>
        </main>
    );
}
