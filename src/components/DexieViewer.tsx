'use client';

import { db, Product } from '@/lib/dexie/productsDB';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'react-hot-toast';

export default function DexieViewer() {
    const products = useLiveQuery(() => db.products.toArray(), []);

    const clearDexie = async () => {
        await db.products.clear();
        toast.success('✅ Локальное хранилище очищено');
    };

    return (
        <div className="mt-8 p-4 bg-gray-100 rounded-md">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-md font-semibold">
                    Локальные товары (Dexie)
                </h2>
                <button
                    onClick={clearDexie}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Очистить всё
                </button>
            </div>

            {!products || products.length === 0 ? (
                <p className="text-sm text-gray-600">
                    Нет данных в локальном хранилище
                </p>
            ) : (
                <ul className="space-y-1 max-h-48 overflow-y-auto text-sm text-gray-800">
                    {products.map((p) => (
                        <li key={p.id}>
                            <span className="font-medium">{p.name}</span> —{' '}
                            {p.quantity} {p.unit}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
