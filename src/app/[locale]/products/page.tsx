'use client';

import { useState, useEffect } from 'react';
import ExcelImport from '@/components/ExcelImport';
import ProductTable from '@/components/ProductTable';
import SyncButton from '@/components/SyncButton';
import { CheckCircle } from 'lucide-react';
import LocalProductManager from '@/components/LocalProductManager';
import { db, Product } from '@/lib/dexie/productsDB';
import { supabase } from '@/lib/supabase/client';
import { ALLOWED } from '@/constans/importKey';


export default function ProductsPage() {
    const [localProducts, setLocalProducts] = useState<Product[]>([]);
    const [remoteProducts, setRemoteProducts] = useState<Product[]>([]);
    const [syncSuccess, setSyncSuccess] = useState(false);

    // 1) загрузить локальные (IndexedDB)
    const fetchLocal = async () => {
        const items = await db.products.toArray();
        setLocalProducts(items);
        setSyncSuccess(false);
    };

    // 2) загрузить удалённые (Supabase)
    const fetchRemote = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) console.error('Ошибка загрузки Supabase:', error);
        else setRemoteProducts(data);
    };

    useEffect(() => {
        fetchLocal();
    }, []);

    
function clean<T extends Record<string, any>>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => ALLOWED.includes(k as keyof Product))
  ) as Product;
}
const handleSync = async () => {
  const allLocal = await db.products.toArray();

  // ⚠️ фильтруем каждую запись
  const payload: Product[] = allLocal.map(p => {
    const cleaned = clean(p);
    return {
      ...cleaned,
      created_at: cleaned.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });

  // upsert, чтобы не дублировать то, что уже есть
  const { error } = await supabase
    .from('products')
    .upsert(payload, { onConflict: 'id', ignoreDuplicates: true });

  if (error) {
    console.error('Ошибка синхронизации:', error);
    alert('Ошибка при синхронизации товаров');
    return;
  }

  // успех
  setSyncSuccess(true);
  // ↙︎ если нужно подгрузить облачные:
  fetchRemote();
};

    return (
        <main className="p-6 space-y-8">
            <h1 className="text-2xl font-bold mb-6">Импорт из XLSX</h1>
            <p className="text-base font-bold mb-6">
                Перенесите список товаров вашего склада в таблицу учёта
            </p>

            {/* Загрузка из Excel в Dexie */}
            <ExcelImport onImport={fetchLocal} />

            {/* Таблица локальных импортированных */}
            {localProducts.length > 0 && (
                <>
                    <h2 className="font-semibold">
                        Локальные товары (до синхронизации)
                    </h2>
                    {/* <ProductTable products={[]} onEdit={function (product: Product): void {
						throw new Error('Function not implemented.');
					} } onDelete={function (id: string): void {
						throw new Error('Function not implemented.');
					} } units={[]}  /> */}
                    <SyncButton onSync={handleSync} />
                </>
            )}

            {/* Сообщение об успехе синхронизации */}
            {syncSuccess && (
                <div className="flex items-center gap-3 text-green-600 dark:text-green-400 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    Товары добавлены в ваш склад
                </div>
            )}

            {/* Таблица облачных товаров после синхронизации */}
            {syncSuccess && remoteProducts.length > 0 && (
                <>
                    <h2 className="font-semibold">Товары из облака</h2>
                    {/* <ProductTable products={remoteProducts} onEdit={function (product: Product): void {
						throw new Error('Function not implemented.');
					} } onDelete={function (id: string): void {
						throw new Error('Function not implemented.');
					} } units={[]} /> */}
                </>
            )}
        </main>
    );
}
