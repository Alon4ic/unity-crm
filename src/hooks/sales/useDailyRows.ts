import { useMemo } from 'react';
import { Sale, Product } from '@/lib/dexie/productsDB';
import { DailySalesRow } from '@/types';

/**
 * Возвращает массив строк для таблицы дневных продаж
 * и флаг showTable (есть ли что‑показать).
 */
export function useDailyRows(
    selectedDate: string | null,
    sales: Sale[],
    products: Product[]
): { dailyRows: DailySalesRow[]; showTable: boolean } {
    return useMemo(() => {
        if (!selectedDate) return { dailyRows: [], showTable: false };

        const sel = new Date(selectedDate);
        const map = new Map<string, DailySalesRow>();

        sales.forEach((sale) => {
            const dt = new Date(sale.created_at);
            if (
                dt.getFullYear() === sel.getFullYear() &&
                dt.getMonth() === sel.getMonth() &&
                dt.getDate() === sel.getDate()
            ) {
                const prod = products.find((p) => p.id === sale.product_id);
                if (!prod) return;

                if (!map.has(sale.product_id)) {
                    const price = prod.price ?? 0;
                    const markup = prod.markup_percent ?? 0;
                    const pw = price * (1 + markup / 100);

                    map.set(sale.product_id, {
                        id: prod.id,
                        name: prod.name,
                        code: prod.code || '',
                        price,
                        price_with_markup: pw,
                        load: 0,
                        return_qty: 0,
                        markup_percent: markup,
                        stock: 0,
                        salesSum: 0,
                    });
                }

                const row = map.get(sale.product_id)!;
                row.load += sale.load;
                row.return_qty += sale.return_qty;
                row.salesSum +=
                    row.price_with_markup * (sale.load - sale.return_qty);
            }
        });

        const rows = Array.from(map.values());
        return { dailyRows: rows, showTable: rows.length > 0 };
    }, [selectedDate, sales, products]);
}
