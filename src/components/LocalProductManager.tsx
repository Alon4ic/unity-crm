'use client';

import { useEffect, useState } from 'react';
import { db, Product } from '@/lib/dexie/productsDB';

export default function LocalProductManager() {
    const [products, setProducts] = useState<Product[]>([]);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');

    // Загрузка из Dexie при загрузке компонента
    useEffect(() => {
        const load = async () => {
            const all = await db.products.toArray();
            setProducts(all);
        };
        load();
    }, []);

    const addProduct = async () => {
        if (!name || !code) return;
        await db.products.add({ name, code });
        const all = await db.products.toArray();
        setProducts(all);
        setName('');
        setCode('');
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">
                Локальные товары (IndexedDB)
            </h2>

            <div className="flex space-x-2">
                <input
                    type="text"
                    placeholder="Код"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="border p-2 rounded"
                />
                <input
                    type="text"
                    placeholder="Название"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 rounded"
                />
                <button
                    onClick={addProduct}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Добавить
                </button>
            </div>

            <ul className="space-y-1">
                {products.map((product) => (
                    <li key={product.id} className="border-b py-1">
                        <strong>{product.code}</strong>: {product.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
