import { Product } from '@/lib/dexie/productsDB';
import { ExtendedProduct } from '@/types';

export function extendProduct(p: Product): ExtendedProduct {
    const markup = Number(p.markup_percent ?? 0);
    const price = Number(p.price ?? 0);
    const quantity = Number(p.quantity ?? 0);

    return {
        ...p,
        product_id: p.id,
        markup_percent: markup,
        sort_order: Number(p.sort_order ?? 0),
        category: '',
        deliveries: 0,
        returns: 0,
        total_loaded: 0,
        total_return: 0,
        price_with_markup: price * (1 + markup / 100),
        cost: price * quantity,
        costWithMarkup: price * (1 + markup / 100) * quantity,
        salesSum: 0,
        sold: 0,
        load: 0,
        return_qty: 0,
        backgroundСolor: '',
    };
}
