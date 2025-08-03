import { db, Sale } from '@/lib/dexie/productsDB';
import { supabase } from '@/lib/supabase';
import { LoadTransaction } from '@/types';

export function useReturnTransfer() {
    async function transferReturnsToNewSession(salePageId: string) {
        // 1. Получаем данные из буфера возвратов
        const { data: returnData, error } = await supabase
            .from('return_buffer')
            .select('*')
            .eq('sale_page_id', salePageId);

        if (error) {
            console.error('Ошибка при получении возвратов:', error.message);
            return;
        }

        if (!returnData || returnData.length === 0) {
            console.log('[useReturnTransfer] Нет возвратов для переноса');
            return;
        }

        // 2. Получаем текущие данные о продуктах
        const products = await db.products.toArray();
        const productMap = new Map(products.map((p) => [p.id, p]));

        // 3. Агрегируем возвраты по sale_page_id и product_id
        const aggregatedReturns = new Map<
            string,
            { product_id: string; quantity: number }
        >();
        for (const entry of returnData) {
            const key = `${salePageId}:${entry.product_id}`;
            const existing = aggregatedReturns.get(key) || {
                product_id: entry.product_id,
                quantity: 0,
            };
            existing.quantity += entry.quantity;
            aggregatedReturns.set(key, existing);
        }

        // 4. Получаем существующие записи sales
        const productIds = Array.from(aggregatedReturns.values()).map(
            (item) => item.product_id
        );
        const existingSales = await db.sales
            .where('sale_page_id')
            .equals(salePageId)
            .filter((sale) => productIds.includes(sale.product_id))
            .toArray();

        const existingSalesMap = new Map<string, Sale>();
        existingSales.forEach((sale) => {
            existingSalesMap.set(sale.product_id, sale);
        });

        // 5. Подготавливаем данные для обновления
        const transactions: LoadTransaction[] = [];
        const salesUpdates: Sale[] = [];
        const today = new Date().toISOString().slice(0, 10);

        for (const [, { product_id, quantity }] of aggregatedReturns) {
            const product = productMap.get(product_id);
            if (!product) {
                console.warn(
                    '[useReturnTransfer] Продукт не найден:',
                    product_id
                );
                continue;
            }

            const markup = product.markup_percent ?? 0;
            const price_with_markup = product.price * (1 + markup / 100);

            // 6. Создаем транзакцию загрузки
            const transactionId = crypto.randomUUID();
            transactions.push({
                id: transactionId,
                sale_page_id: salePageId,
                product_id,
                load: quantity,
                return_qty: 0,
                price: product.price,
                price_with_markup: price_with_markup,
                markup,
                created_at: new Date().toISOString(),
            });

            // 7. Обновляем запись в sales с суммированием load
            const existingSale = existingSalesMap.get(product_id);
            const newLoad = (existingSale?.load || 0) + quantity;

            salesUpdates.push({
                id: existingSale?.id || crypto.randomUUID(),
                sale_page_id: salePageId,
                product_id,
                load: newLoad,
                return_qty: existingSale?.return_qty || 0,
                updated_at: new Date().toISOString(),
                created_at:
                    existingSale?.created_at || new Date().toISOString(),
                created_date: today, // Добавлено
            });
        }

        // 8. Сохраняем транзакции в Supabase и локально
        const { error: txError } = await supabase
            .from('load_transactions')
            .upsert(transactions, { onConflict: 'id' });

        if (txError) {
            console.error('Ошибка при сохранении транзакций:', txError.message);
        } else {
            await db.load_transactions.bulkAdd(transactions);
            console.log(
                '[useReturnTransfer] Сохранено в Dexie load_transactions:',
                transactions
            );
        }

        // 9. Обновляем продажи в Supabase и локально
        const { error: salesError } = await supabase
            .from('sales')
            .upsert(salesUpdates, {
                onConflict: 'sale_page_id,product_id,created_date',
            });

        if (salesError) {
            console.error('Ошибка при обновлении продаж:', salesError.message);
        } else {
            await db.sales.bulkPut(salesUpdates);
        }

        // 10. Очищаем буфер возвратов
        const bufferIds = returnData.map((item) => item.id);
        await supabase.from('return_buffer').delete().in('id', bufferIds);
        await db.return_buffer.bulkDelete(bufferIds);

        // 11. Обновляем количество товаров
        for (const [, { product_id, quantity }] of aggregatedReturns) {
            const product = await db.products.get(product_id);
            if (product) {
                const newQuantity = (product.quantity || 0) + quantity;
                await db.products.update(product_id, {
                    quantity: newQuantity,
                });
            }
        }
    }

    return { transferReturnsToNewSession };
}
