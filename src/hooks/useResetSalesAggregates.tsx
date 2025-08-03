import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { db, LoadTransaction } from '@/lib/dexie/productsDB';
import { supabase } from '@/lib/supabase/client';

export function useResetSalesAggregates(
    salePageId: string | undefined,
    setEvents: React.Dispatch<React.SetStateAction<LoadTransaction[]>>,
    fetchProducts: () => Promise<void>
) {
    const resetSalesAggregates = useCallback(async () => {
        if (!salePageId) return;

        try {
            const isOnline = navigator.onLine;

            let transactions: LoadTransaction[] = [];

            if (isOnline) {
                const { data, error } = await supabase
                    .from('load_transactions')
                    .select(
                        'id,sale_page_id,product_id,load,return_qty,price,markup,price_with_markup,created_at'
                    )
                    .eq('sale_page_id', salePageId);

                if (error) throw error;

                transactions = data ?? [];
                console.log(
                    `[resetSalesAggregates] Транзакции до очистки (Supabase, ${transactions.length} записей):`,
                    transactions
                );

                await db.load_transactions
                    .where('sale_page_id')
                    .equals(salePageId)
                    .delete();
                await db.load_transactions.bulkPut(transactions);
            } else {
                transactions = await db.load_transactions
                    .where('sale_page_id')
                    .equals(salePageId)
                    .toArray();
                console.log(
                    `[resetSalesAggregates] Транзакции до очистки (Dexie, офлайн, ${transactions.length} записей):`,
                    transactions
                );
            }

            await db.load_transactions
                .where('sale_page_id')
                .equals(salePageId)
                .delete();
            console.log(
                '[resetSalesAggregates] Транзакции очищены в Dexie для sale_page_id:',
                salePageId
            );

            if (isOnline) {
                const { error } = await supabase
                    .from('load_transactions')
                    .delete()
                    .eq('sale_page_id', salePageId);

                if (error) throw error;
            } else {
                toast(
                    'Транзакции очищены локально, синхронизация недоступна в офлайн-режиме',
                    { icon: '⚠️' }
                );
            }

            setEvents((prev) =>
                prev.filter((e) => e.sale_page_id !== salePageId)
            );
            await fetchProducts();

            toast.success('Транзакции текущей страницы очищены');
        } catch (e) {
            console.error('[resetSalesAggregates] Ошибка:', e);
            toast.error('Не удалось очистить транзакции');
        }
    }, [salePageId, setEvents, fetchProducts]);

    return { resetSalesAggregates };
}
