import { ExtendedProduct } from '@/types';
import { Product } from '@/lib/dexie/productsDB';

export function toProduct(extended: ExtendedProduct): Product {
    return {
        id: extended.id,
        name: extended.name,
        code: extended.code ?? null,
        unit: extended.unit || 'шт',
        price: extended.price,
        quantity: extended.quantity,
        markup_percent: extended.markup_percent ?? null,
        category_id: extended.category_id ?? null,
        initial_quantity: extended.initial_quantity ?? null,
        created_at: extended.created_at ?? null,
        updated_at: extended.updated_at ?? new Date().toISOString(),
        sort_order: extended.sort_order ?? null,
        background_color: extended.background_color ?? null,
    };
}
