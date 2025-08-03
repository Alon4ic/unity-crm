import { Dispatch, SetStateAction, useState } from 'react';
import { db } from '@/lib/dexie/productsDB';
import { supabase } from '@/lib/supabase/client';
import { extendProduct } from '@/utils/extendProduct';
import { toProduct } from '@/utils/productUtils';
import { Product } from '@/lib/dexie/productsDB';
import { ExtendedProduct } from '@/types';
import toast from 'react-hot-toast';
import useSaveProduct from './useSaveProduct';

interface UseAddProductOptions {
    products: ExtendedProduct[];
    setProducts: Dispatch<SetStateAction<ExtendedProduct[]>>;
}

export function useAddProduct({ products, setProducts }: UseAddProductOptions) {
    const [loading, setLoading] = useState(false);
    const { saveProduct } = useSaveProduct();

    const addProduct = async (
        newProduct: Omit<
            Product,
            'id' | 'created_at' | 'updated_at' | 'sort_order'
        >
    ) => {
        setLoading(true);
        const id = crypto.randomUUID();
        let addedToUI = false;

        try {
            const categoryProducts = products.filter(
                (p) => p.category_id === newProduct.category_id
            );

            const maxSortOrder = Math.max(
                ...categoryProducts.map((p) => p.sort_order ?? 0),
                0
            );

            const baseProduct: Product = {
                ...newProduct,
                id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                sort_order: maxSortOrder + 10,
            };

            const product = extendProduct(baseProduct);

            // 1. Добавляем в UI
            setProducts((prev) => [...prev, product]);
            addedToUI = true;

            // 2. Сохраняем в IndexedDB
            await db.products.put(toProduct(product));

            // 3. Асинхронная отправка в Supabase
            saveProduct(product)
                .then((saved) => {
                    setProducts((prev) =>
                        prev.map((p) => (p.id === id ? saved : p))
                    );
                })
                .catch((err) => {
                    console.error('Ошибка фоновой синхронизации:', err);
                    toast.error(`Ошибка синхронизации: ${err.message}`);
                });

            toast.success('✅ Товар добавлен!');
        } catch (err: any) {
            console.error('Ошибка при добавлении товара:', err);
            if (addedToUI) {
                setProducts((prev) => prev.filter((p) => p.id !== id));
            }
            toast.error(`❌ ${err.message || 'Неизвестная ошибка'}`);
        } finally {
            setLoading(false);
        }
    };
    return { addProduct, loading };
}
