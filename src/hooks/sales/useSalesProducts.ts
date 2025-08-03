import { useCallback, useRef } from 'react';
import { Sale, db } from '@/lib/dexie/productsDB';
import { ExtendedProduct } from '@/types';

export function useSalesProducts(
    salePageId: string | undefined,
    setProducts: (products: ExtendedProduct[]) => void
) {
    const cacheRef = useRef<Map<string, ExtendedProduct[]>>(new Map());

    const fetchProducts = useCallback(async () => {
        if (!salePageId) return;

        // 🔍 Проверка кэша
        if (cacheRef.current.has(salePageId)) {
            setProducts(cacheRef.current.get(salePageId)!);
            return;
        }

        try {
            const allProducts = await db.products.toArray();
            const sales = await db.sales
                .where('sale_page_id')
                .equals(salePageId)
                .toArray();

            const salesMap = new Map<string, Sale>(
                sales.map((s) => [s.product_id, s])
            );

            const productsWithSales: ExtendedProduct[] = allProducts.map(
                (product) => {
                    const sale = salesMap.get(product.id);
                    return {
                        ...product,
                        // приводим category к undefined, если null
                        category: (product as any).category ?? undefined,
                        markup_percent: product.markup_percent ?? 0,
                        return_qty: sale?.return_qty ?? 0,
                        background_color:
                            (sale?.load ?? 0) || (sale?.return_qty ?? 0)
                                ? 'rgba(0, 128, 0, 0.15)'
                                : '',
                        initial_quantity: null,
                        code: product.code ?? undefined,
                        created_at: product.created_at ?? '',
                        updated_at: product.updated_at ?? '',
                        sort_order: product.sort_order ?? undefined,
                    };
                }
            );

            // ✅ Кладём в кэш
            cacheRef.current.set(salePageId, productsWithSales);

            setProducts(productsWithSales);
        } catch (err) {
            console.error('Ошибка при загрузке продуктов:', err);
        }
    }, [salePageId, setProducts]);

    return { fetchProducts };
}
