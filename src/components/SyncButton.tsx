'use client';

import { useState } from 'react';
import Spinner from './ui/Spinner';

export default function SyncButton({ onSync }: { onSync: () => void }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [syncing, setSyncing] = useState(false);

    const handleSync = async () => {
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch('/api/sync-products', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                setMessage(`✅ ${data.message} (${data.count || 0})`);
                onSync();
            } else {
                setMessage(
                    `❌ Ошибка: ${data.error?.message || 'неизвестная'}`
                );
            }
        } catch (err) {
            console.error('Ошибка синхронизации:', err);
            setMessage('❌ Ошибка при синхронизации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <button
                onClick={handleSync}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <Spinner />
                        Синхронизация...
                    </>
                ) : (
                    'Синхронизировать'
                )}
            </button>
            {message && <p className="text-sm">{message}</p>}
        </div>
    );
}
