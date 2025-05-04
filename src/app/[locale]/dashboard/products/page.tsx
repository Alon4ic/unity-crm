'use client';

import { useState, useEffect } from 'react';
import ExcelImport from '@/components/ExcelImport';
import ProductTable from '@/components/ProductTable';
import SyncButton from '@/components/SyncButton';
import { CheckCircle } from 'lucide-react';
import LocalProductManager from '@/components/LocalProductManager';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/import-products');
            const data = await res.json();
            setProducts(data);
            setIsImporting(data.length > 0); // Показываем таблицу, если есть импортированные товары
            setSyncSuccess(false); // сбрасываем флаг успешной синхронизации
        } catch (err) {
            console.error('Ошибка при загрузке товаров:', err);
        }
    };

    const handleSync = async () => {
        const res = await fetch('/api/sync-products', { method: 'POST' });
        const result = await res.json();
        if (res.ok) {
            setSyncSuccess(true);
            setProducts([]);
            setIsImporting(false);
        } else {
            console.error('Ошибка при синхронизации:', result.error);
        }
    };

    return (
        <main className="p-6 space-y-8">
            <h1 className="text-2xl font-bold mb-6">Импорт из XLSX</h1>
            <p className="text-base font-bold mb-6">
                Перенесите список товаров вашего склада в таблицу учета
            </p>
            <LocalProductManager />

            <ExcelImport onImport={fetchProducts} />

            {isImporting && products.length > 0 && (
                <ProductTable products={products} />
            )}

            {isImporting && <SyncButton onSync={handleSync} />}

            {syncSuccess && (
                <div className="flex items-center gap-3 text-green-600 dark:text-green-400 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    Товары добавлены в ваш склад
                </div>
            )}
        </main>
    );
}
