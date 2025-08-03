import { db } from '@/lib/dexie/productsDB';
import { Product } from '@/lib/dexie/productsDB';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function searchProducts(query: string): Promise<Product[]> {
    const trimmed = query.trim().toLowerCase();

    // Поиск в локальной базе (Dexie)
    const localResults = await db.products
        .filter(
            (item) =>
                (typeof item.name === 'string' &&
                    item.name.toLowerCase().includes(trimmed)) ||
                (typeof item.code === 'string' &&
                    item.code.toLowerCase().includes(trimmed))
        )
        .toArray();

    if (localResults.length > 0) {
        return localResults;
    }

    // Если ничего не найдено — пробуем онлайн Supabase
    try {
        const { data, error } = await supabase
            .from('products')
            .select('id, name, code, unit, price, quantity, created_at')
            .or(`name.ilike.%${trimmed}%,code.ilike.%${trimmed}%`)
            .limit(10);

        if (error || !data) {
            console.error('Ошибка Supabase:', error?.message);
            return [];
        }

        // Кэшируем результаты в Dexie
        for (const product of data) {
            await db.products.put(product);
        }

        return data;
    } catch (err) {
        console.error('Ошибка соединения с Supabase:', err);
        return [];
    }
}
