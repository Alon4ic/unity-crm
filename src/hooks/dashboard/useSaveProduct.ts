'use client';

import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { db, Product } from '@/lib/dexie/productsDB';
import { supabase } from '@/lib/supabase/client';
import { ExtendedProduct } from '@/types';
import { toProduct } from '@/utils/productUtils';

export default function useSaveProduct() {
    const saveProduct = useCallback(
        async (updated: ExtendedProduct): Promise<ExtendedProduct> => {
            if (!updated || typeof updated !== 'object') {
                throw new Error('❌ Неверный payload товара');
            }

            if (!updated.id) {
                throw new Error('❌ Отсутствует ID товара');
            }

            const isNewProduct = updated.id.startsWith('temp-');
            let supabaseProduct: Product = toProduct(updated);

            // Генерация нового UUID для новых продуктов
            if (isNewProduct) {
                // Создаем новый ID только для Supabase
                const newId = crypto.randomUUID();
                supabaseProduct = {
                    ...supabaseProduct,
                    id: newId,
                };
            }

            // Валидация данных
            if (isNewProduct) {
                if (
                    !supabaseProduct.name ||
                    !supabaseProduct.code ||
                    !supabaseProduct.unit
                ) {
                    throw new Error(
                        'Заполните все обязательные поля: наименование, код, единица измерения'
                    );
                }
            }

            if (
                supabaseProduct.category_id &&
                !/^[0-9a-fA-F-]{36}$/.test(supabaseProduct.category_id)
            ) {
                throw new Error(
                    `Некорректный UUID в category_id: ${supabaseProduct.category_id}`
                );
            }

            if (
                isNaN(supabaseProduct.quantity) ||
                supabaseProduct.quantity < 0
            ) {
                throw new Error(
                    'Остаток не может быть отрицательным или некорректным'
                );
            }

            if (isNaN(supabaseProduct.price)) {
                throw new Error('Цена должна быть числом');
            }

            // Сохранение в Supabase
            const { error } = await supabase
                .from('products')
                .upsert([supabaseProduct]);

            if (error) {
                console.error(
                    'Ошибка Supabase:',
                    JSON.stringify(error, null, 2)
                );
                throw error;
            }

            // Сохранение в IndexedDB
            if (isNewProduct) {
                // Удаляем временный продукт и добавляем с новым ID
                await db.products.delete(updated.id);
            }
            await db.products.put(supabaseProduct);

            // Возвращаем продукт с актуальным ID
            return {
                ...updated,
                id: supabaseProduct.id,
            };
        },
        []
    );

    return { saveProduct };
}
