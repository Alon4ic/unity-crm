'use client';

import { useEffect, useState } from 'react';

export default function ProductTable() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                if (!res.ok) {
                    throw new Error('Ошибка загрузки товаров');
                }
                const json = await res.json();
                setProducts(json.products || []);
            } catch (err) {
                console.error(err);
                setError('Не удалось загрузить товары');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <p className="text-center text-gray-500">Загрузка товаров...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    if (products.length === 0) {
        return (
            <p className="text-center text-gray-500">
                Нет товаров для отображения.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border">
                <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                        <th className="border p-2">Код</th>
                        <th className="border p-2">Наименование</th>
                        <th className="border p-2">Единица</th>
                        <th className="border p-2">Цена</th>
                        <th className="border p-2">Количество</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td className="border p-2">{product.code}</td>
                            <td className="border p-2">{product.name}</td>
                            <td className="border p-2">{product.unit}</td>
                            <td className="border p-2">{product.price}</td>
                            <td className="border p-2">{product.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
