import { useMemo } from 'react';
import { ExtendedProduct, RowForTable } from '@/types';


export function useRowsForSalesTable(
    products: ExtendedProduct[],
    totalsByProduct: Map<string, { total_loaded: number; total_return: number }>
): RowForTable[] {
    return useMemo(() => {
        return products.map<RowForTable>((p) => {
            const totals = totalsByProduct.get(p.id) ?? {
                total_loaded: 0,
                total_return: 0,
            };

            const price = p.price ?? 0;
            const markup = p.markup_percent ?? 0;
            const markupValue = price * (markup / 100);
            const price_with_markup = price + markupValue;

            const totalLoaded = totals.total_loaded;
            const totalReturn = totals.total_return;
            const stock = totalLoaded - totalReturn;
            const salesSum = price_with_markup * stock;

            return {
                ...p,
                category: p.category ?? undefined,
                markup_percent: markup,
                markup: markupValue,
                load: 0,
                return_qty: 0,
                total_loaded: totalLoaded,
                total_return: totalReturn,
                stock,
                salesSum,
                price_with_markup,
            };
        });
    }, [products, totalsByProduct]);
}
