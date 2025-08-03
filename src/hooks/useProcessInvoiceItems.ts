// hooks/useProcessInvoiceItems.ts
import { db } from '@/lib/dexie/productsDB';
import { supabase } from '@/lib/supabase'; // Supabase client
import { ParsedItem } from '@/types';

import { useCallback } from 'react';

export function useProcessInvoiceItems() {
    return useCallback(async (items: ParsedItem[]) => {
        for (const item of items) {
            const normalizedName = item.name
                .toLowerCase()
                .replace(/[^a-zа-я0-9]/gi, '');

            // 🔍 Поиск по коду, затем по имени
            const existing = await db.products
                .toArray()
                .then((all) =>
                    all.find(
                        (p) =>
                            (item.code && p.code === item.code) ||
                            p.name
                                .toLowerCase()
                                .replace(/[^a-zа-я0-9]/gi, '') ===
                                normalizedName
                    )
                );

            if (existing) {
                const updatedQuantity =
                    (existing.quantity || 0) + item.quantity;

                // 🔄 Обновление в Dexie
                await db.products.update(existing.id, {
                    quantity: updatedQuantity,
                    unit: item.unit ?? existing.unit,
                    price: item.price ?? existing.price,
                });

                // 🔄 Обновление в Supabase
                await supabase
                    .from('products')
                    .update({
                        quantity: updatedQuantity,
                        unit: item.unit ?? existing.unit,
                        price: item.price ?? existing.price,
                    })
                    .eq('id', existing.id);
            } else {
                // ➕ Новый товар
                const { data, error } = await supabase
                    .from('products')
                    .insert({
                        name: item.name,
                        code: item.code,
                        quantity: item.quantity,
                        unit: item.unit,
                        price: item.price,
                    })
                    .select()
                    .single();

                if (data && !error) {
                    await db.products.add(data);
                } else {
                    console.warn(
                        'Ошибка при добавлении товара в Supabase',
                        error
                    );
                }
            }
        }
    }, []);
}
