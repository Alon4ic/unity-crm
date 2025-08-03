// hooks/dashboard/useBatchUpdateProducts.ts
'use client';

import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '@/lib/dexie/productsDB';
import { supabase } from '@/lib/supabase/client';
import { ExtendedProduct } from '@/types';
import { toProduct } from '@/utils/productUtils';

export default function useBatchUpdateProducts() {
    const batchUpdateProducts = useCallback(
        async (products: ExtendedProduct[]) => {
            try {
                const updatable = products.filter(
                    (p) => typeof p.id === 'string' && p.id.length > 0
                );

                const updatePromises = updatable.map((product) => {
                    return supabase
                        .from('products')
                        .update({
                            sort_order: product.sort_order,
                            category_id: product.category_id,
                        })
                        .eq('id', product.id);
                });

                const results = await Promise.all(updatePromises);
                const errors = results.filter((r) => r.error);

                if (errors.length > 0) {
                    const errorMessages = errors
                        .map((e) => e.error?.message)
                        .join('; ');
                    throw new Error(
                        `Ошибка при обновлении порядка`
                    );
                }

                await db.products.bulkPut(products.map(toProduct));
                toast.success('✅ Порядок обновлён');
                return true;
            } catch (err: any) {
                console.error('🚫 Ошибка при обновлении порядка:', err);
                toast.error(`❌ 'Неизвестная ошибка'}`);
                throw err;
            }
        },
        []
    );

    return { batchUpdateProducts };
}
