import { Sale } from '@/lib/dexie/productsDB';
import { useMemo } from 'react';

export function useTotalsByProduct(sales: Sale[]) {
    return useMemo(() => {
        const totals = new Map<
            string,
            { total_loaded: number; total_return: number }
        >();

        for (const sale of sales) {
            const { product_id, load, return_qty } = sale;
            const prev = totals.get(product_id) ?? {
                total_loaded: 0,
                total_return: 0,
            };
            totals.set(product_id, {
                total_loaded: prev.total_loaded + load,
                total_return: prev.total_return + return_qty,
            });
        }

        return totals;
    }, [sales]);
}
