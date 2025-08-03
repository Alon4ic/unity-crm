import { Product, ExtendedProduct } from '@/types';

/**
 * Приводит объект Product к типу ExtendedProduct, гарантируя корректные типы и значения.
 */
export function normalizeProductForReport(product: Product): ExtendedProduct {
    return {
        ...product,
        markup_percent: product.markup_percent ?? 0,
        category: product.category ?? undefined,
        cost: 0,
        costWithMarkup: 0,
        stock: 0,
        salesSum: 0,
        sold: 0,
        price_with_markup: 0,
        backgroundСolor: product.backgroundСolor ?? undefined,
        deliveries: product.deliveries ?? 0,
        returns: product.returns ?? 0,
        load: 0,
        return_qty: 0,
        total_loaded: product.total_loaded ?? 0,
        total_return: product.total_return ?? 0,
    };
}
