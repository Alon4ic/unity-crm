import { Product } from '@/lib/dexie/productsDB';

export const uuid = () => crypto.randomUUID();

export function mapSupabaseProductToProduct(supabaseProduct: any): Product {
    return {
        ...supabaseProduct,
        code: supabaseProduct.code ?? undefined,
        backgroundСolor: supabaseProduct.backgroundСolor ?? undefined,
        backgroundСolor: supabaseProduct.backgroundСolor ?? undefined,
        category_id: supabaseProduct.category_id ?? undefined,
        created_at: supabaseProduct.created_at ?? undefined,
        initial_quantity: supabaseProduct.initial_quantity ?? undefined,
        price: supabaseProduct.price ?? undefined,
        quantity: supabaseProduct.quantity ?? undefined,
        sort_order: supabaseProduct.sort_order ?? undefined,
        updated_at: supabaseProduct.updated_at ?? undefined,
        // другие поля, если нужно
    };
}
