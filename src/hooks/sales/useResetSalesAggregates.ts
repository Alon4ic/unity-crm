import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import { db, type LoadTransaction } from '@/lib/dexie/productsDB';

/**
 * Возвращает функцию resetSalesAggregates, которая
 * 1) копирует транзакции (если онлайн) ─ чтобы не потерять историю;
 * 2) очищает load_transactions в Dexie и (если онлайн) в Supabase;
 * 3) обновляет локальный state events;
 * 4) вызывает fetchProducts для пересчёта остатков.
 */
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

            /* ---------- 1. Сохраняем копию (если онлайн) ---------- */
            if (isOnline) {
                const { data, error } = await supabase
                    .from('load_transactions')
                    .select('*')
                    .eq('sale_page_id', salePageId);

                if (error) throw error;
                transactions = data ?? [];

                await db.load_transactions
                    .where('sale_page_id')
                    .equals(salePageId)
                    .delete();
                if (transactions.length) {
                    await db.load_transactions.bulkPut(transactions);
                }
            } else {
                transactions = await db.load_transactions
                    .where('sale_page_id')
                    .equals(salePageId)
                    .toArray();
            }

            /* ---------- 2. Полная очистка ---------- */
            await db.load_transactions
                .where('sale_page_id')
                .equals(salePageId)
                .delete();

            if (isOnline) {
                const { error } = await supabase
                    .from('load_transactions')
                    .delete()
                    .eq('sale_page_id', salePageId);

                if (error) throw error;
            } else {
                toast(
                    'Транзакции очищены локально, синхронизация недоступна (оффлайн)',
                    {
                        icon: '⚠️',
                    }
                );
            }

            /* ---------- 3. Обновляем state и товары ---------- */
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
