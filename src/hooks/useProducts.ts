


import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { db } from '@/lib/dexie/productsDB';
import { ExtendedProduct } from '@/types';
import { extendProduct } from '@/utils/extendProduct';
import { toProduct } from '@/utils/productUtils';
import { mapSupabaseProductToProduct } from '@/utils';

export function useProducts() {
    const [products, setProducts] = useState<ExtendedProduct[]>([]);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('category_id', { ascending: true, nullsFirst: true })
                .order('sort_order', { ascending: true })
                .order('name', { ascending: true });

            if (error) throw error;
            const extended = data.map((d) =>
                extendProduct(mapSupabaseProductToProduct(d))
            );

            if (extended.length > 0) {
                await db.products.clear();
                await db.products.bulkPut(extended.map(toProduct));
            }

            setProducts(extended);
        } catch (err: any) {
            console.error('Ошибка при загрузке из Supabase:', err);

            const local = await db.products.toArray();
            const extended = local.map(extendProduct);
            setProducts(extended);
        }
    };

return {
    products,
    setProducts,
    fetchProducts,
};
}
