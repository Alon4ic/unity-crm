import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import { Sale, db } from '@/lib/dexie/productsDB';

const uuid = () => crypto.randomUUID();

export function useSalesFetcher(
    salePageId: string | undefined,
    setSales: (sales: Sale[]) => void
) {
    const fetchSales = useCallback(async () => {
        if (!salePageId) return;

        try {
            const isOnline = navigator.onLine;
            let rows: Sale[] = [];

            if (isOnline) {
                const { data, error } = await supabase
                    .from('sales')
                    .select(
                        'id,product_id,sale_page_id,load,return_qty,created_at,updated_at,created_date'
                    )
                    .eq('sale_page_id', salePageId);

                if (error) throw error;

                rows = (data ?? []).map((r) => ({
                    id: r.id ?? uuid(),
                    product_id: r.product_id,
                    sale_page_id: r.sale_page_id,
                    load: r.load ?? 0,
                    return_qty: r.return_qty ?? 0,
                    created_at: r.created_at ?? new Date().toISOString(),
                    updated_at: r.updated_at ?? new Date().toISOString(),
                    created_date:
                        r.created_date ??
                        (r.created_at
                            ? new Date(r.created_at).toISOString().slice(0, 10)
                            : new Date().toISOString().slice(0, 10)),
                }));

                await db.sales
                    .where('sale_page_id')
                    .equals(salePageId)
                    .delete();
                await db.sales.bulkPut(rows);

                const dexieRows = await db.sales
                    .where('sale_page_id')
                    .equals(salePageId)
                    .toArray();
            } else {
                rows = await db.sales
                    .where('sale_page_id')
                    .equals(salePageId)
                    .toArray();

                if (!rows.length) {
                    toast('Нет данных о продажах в офлайн-режиме', {
                        icon: '⚠️',
                    });
                }
            }

            setSales(rows);
        } catch (e) {
            console.error('[fetchSales] Ошибка:', e);
            toast.error('Не удалось загрузить данные о продажах');
        }
    }, [salePageId, setSales]);

    return { fetchSales };
}
