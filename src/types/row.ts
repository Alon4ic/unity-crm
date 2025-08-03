import type { Product } from '@/lib/dexie/productsDB';

/** всё, что может быть в строке таблицы любого режима */
export type ExtendedProduct = Product & {
    /* ─ поля продаж ─ */
    markup_percent?: number;
    load?: number;
    return_qty?: number;
    product_id?: string;
    total_loaded?: number;
    total_return?: number;
    /* ─ поля поставок (для future supplies) ─ */
    price_with_markup?: number;
    /* ─ вычисляемые в UI ─ */
    cost?: number;
    costWithMarkup?: number;
    stock?: number;
    salesSum?: number;
    sold?: number;
    unit_id?: string | { code: string } | null;
    returns?: number;
    deliveries?: number;
};
