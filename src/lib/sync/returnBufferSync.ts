import { supabase } from '@/lib/supabase';
import { LoadTransaction, Product, db } from '../dexie/productsDB';
import { ReturnBuffer } from '@/types'; // предполагается, что он обновлён с полем id
import { v4 as uuidv4 } from 'uuid'; // если нужно генерировать id

/** Получить все записи из Supabase и сохранить в Dexie */
export async function fetchReturnBufferFromSupabase() {
    const { data, error } = await supabase.from('return_buffer').select('*');

    if (error) {
        console.error(
            'Ошибка при загрузке return_buffer из Supabase:',
            error.message
        );
        return;
    }

    if (data) {
        await db.return_buffer.clear();
        await db.return_buffer.bulkAdd(data); // теперь id в каждой записи есть
    }
}

/** Синхронизировать все записи из Dexie в Supabase */
export async function syncReturnBufferToSupabase() {
    const localData = await db.return_buffer.toArray();

    const { error } = await supabase.from('return_buffer').upsert(localData, {
        onConflict: 'id', // ✅ используем id как ключ
    });

    if (error) {
        console.error(
            'Ошибка при отправке return_buffer в Supabase:',
            error.message
        );
    }
}

/** Сохранить последние значения возвратов по каждому товару */
export async function saveReturnBuffer(
    salePageId: string,
    latestByProduct: Map<string, number>
) {
    const bufferEntries: ReturnBuffer[] = Array.from(
        latestByProduct.entries()
    ).map(([product_id, quantity]) => ({
        id: uuidv4(), // 👈 теперь нужен id
        sale_page_id: salePageId,
        product_id,
        quantity,
        inserted_at: new Date().toISOString(),
    }));

    await db.return_buffer.clear();
    await db.return_buffer.bulkAdd(bufferEntries);

    await syncReturnBufferToSupabase();
}

/** Преобразовать буфер возвратов в транзакции загрузки */
export async function applyReturnBufferAsLoadTransactions(salePageId: string) {
    await fetchReturnBufferFromSupabase();

    const buffer = await db.return_buffer
        .where('sale_page_id')
        .equals(salePageId)
        .toArray();

    const products: Product[] = await db.products.toArray();
    const productMap = new Map<string, Product>(products.map((p) => [p.id, p]));

    const transactions = buffer
        .map((entry): LoadTransaction | null => {
            const product = productMap.get(entry.product_id);
            if (!product) return null;

            const markup = product.markup_percent ?? 0;
            const price_with_warkup = product.price * (1 + markup / 100);

            return {
                id: crypto.randomUUID(),
                sale_page_id: salePageId,
                product_id: entry.product_id,
                load: entry.quantity,
                return_qty: 0,
                price: product.price,
                price_with_markup: price_with_warkup,
                markup,
                created_at: new Date().toISOString(),
            };
        })
        .filter((t): t is LoadTransaction => t !== null);

    await db.load_transactions.bulkAdd(transactions);
}
