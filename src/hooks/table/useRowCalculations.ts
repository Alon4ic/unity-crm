import { useMemo } from 'react';
import {
    getTotalLoadForProductOnPage,
    getTotalReturnForProductOnPage,
} from '@/utils/loadHelpers';
import { ExtendedProduct, LoadTransaction } from '@/types';

export function useRowCalculations(
    products: ExtendedProduct[],
    transactions: LoadTransaction[],
    salePageId: string
) {
    return useMemo(() => {
        return products.map((p) => {
            const totalLoaded = getTotalLoadForProductOnPage(
                transactions,
                salePageId,
                p.id
            );
            const totalReturn = getTotalReturnForProductOnPage(
                transactions,
                salePageId,
                p.id
            );

            const price = p.price ?? 0;
            const markupPct = p.markup_percent ?? 0;
            const soldQuantity = Math.max(0, totalLoaded - totalReturn);
            const priceWithMarkup = price * (1 + markupPct / 100);
            const quantity = p.quantity ?? 0;

            return {
                ...p,
                total_loaded: totalLoaded,
                total_return: totalReturn,
                price_with_markup: priceWithMarkup,
                cost: price * quantity,
                costWithMarkup: priceWithMarkup * quantity,
                stock: soldQuantity,
                salesSum: parseFloat(
                    (priceWithMarkup * soldQuantity).toFixed(2)
                ),
                sold: soldQuantity,
                deliveries: p.deliveries ?? 0,
                returns: p.returns ?? 0,
            };
        });
    }, [products, transactions, salePageId]);
}
