import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { db, type LoadTransaction } from '@/lib/dexie/productsDB';
import { supabase } from '@/lib/supabase/client';

export function useLoadEventsFetcher(
    salePageId: string | undefined,
    setEvents: (rows: LoadTransaction[]) => void
) {
    const fetchEvents = useCallback(async () => {
        if (!salePageId) return;

        try {
            const isOnline = navigator.onLine;
            let rows: LoadTransaction[] = [];

            if (isOnline) {
                const { data, error } = await supabase
                    .from('load_transactions')
                    .select('*')
                    .eq('sale_page_id', salePageId)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                rows = data || [];

                // обновляем Dexie атомарно
                await db.transaction('rw', db.load_transactions, async () => {
                    await db.load_transactions
                        .where('sale_page_id')
                        .equals(salePageId)
                        .delete();
                    if (rows.length) {
                        await db.load_transactions.bulkAdd(rows);
                    }
                });
            } else {
                rows = await db.load_transactions
                    .where('sale_page_id')
                    .equals(salePageId)
                    .sortBy('created_at');

            }

            setEvents(rows);
        } catch (e) {
            console.error('[fetchEvents] Ошибка:', e);
            toast.error('Ошибка загрузки событий загрузки');
        }
    }, [salePageId, setEvents]);

    return { fetchEvents };
}
