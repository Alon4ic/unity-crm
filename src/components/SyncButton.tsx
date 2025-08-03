'use client';

import { useState } from 'react';
import Spinner from './ui/Spinner';
import { db } from '@/lib/dexie/productsDB';

export default function SyncButton({ onSync }: { onSync: () => void }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

    const handleSync = async () => {
        setLoading(true);
        setMessage('');
        setIsSuccess(null);

        try {
            const products = await db.products.toArray();

            if (products.length === 0) {
                setMessage('❗️Нет товаров для синхронизации');
                setIsSuccess(false);
                return;
            }

            const res = await fetch('/api/sync-products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(products),
            });

            const data = await res.json();

            if (res.ok) {
                // Используем data.uploaded вместо data.count
                setMessage(`✅ Синхронизировано: ${data.uploaded} товаров`);
                setIsSuccess(true);
                onSync(); // Обновление отображения после успешной синхронизации
            } else {
                setMessage(`❌ Ошибка: ${data.error}`);
                setIsSuccess(false);
            }
        } catch (err) {
            setMessage('❌ Ошибка при синхронизации');
            setIsSuccess(false);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <button
                onClick={handleSync}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <Spinner />
                        <span>Синхронизация...</span>
                    </div>
                ) : (
                    'Синхронизировать'
                )}
            </button>
            {message && (
                <p
                    className={`text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}
                >
                    {message}
                </p>
            )}
        </div>
    );
}
