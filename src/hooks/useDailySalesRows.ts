import { useEffect, useState } from 'react';
import { Sale, Product } from '@/lib/dexie/productsDB';
import { DailySalesRow } from '@/types';

export function useDailySalesRows(
    selectedDate: string | null,
    sales: Sale[],
    products: Product[]
) {
    const [dailyRows, setDailyRows] = useState<DailySalesRow[]>([]);
    const [showTable, setShowTable] = useState(false);

    useEffect(() => {
        if (!selectedDate) {
            setDailyRows([]);
            setShowTable(false);
            console.log(
                '[useDailySalesRows] No selectedDate, cleared dailyRows'
            );
            return;
        }

        const sel = new Date(selectedDate);
        const map = new Map<string, DailySalesRow>();

        console.log('[useDailySalesRows] Processing sales:', {
            selectedDate,
            salesCount: sales.length,
            productsCount: products.length,
        });

        sales.forEach((sale) => {
            const dt = new Date(sale.created_at);
            if (
                dt.getFullYear() === sel.getFullYear() &&
                dt.getMonth() === sel.getMonth() &&
                dt.getDate() === sel.getDate()
            ) {
                const prod = products.find((p) => p.id === sale.product_id);
                if (!prod) {
                    console.log(
                        '[useDailySalesRows] Product not found for sale:',
                        sale
                    );
                    return;
                }

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
                        stock: prod.stock ?? 0,
                        salesSum: 0,
                    });
                }

                const row = map.get(sale.product_id)!;
                row.load += sale.load ?? 0;
                row.return_qty += sale.return_qty ?? 0;
                row.salesSum +=
                    row.price_with_markup * (sale.load - sale.return_qty);
                console.log('[useDailySalesRows] Updated row:', row);
            }
        });

        const newRows = Array.from(map.values());
        setDailyRows(newRows);
        setShowTable(true);
        console.log('[useDailySalesRows] Generated dailyRows:', newRows);
    }, [selectedDate, sales, products]);

    return { dailyRows, showTable };
}
