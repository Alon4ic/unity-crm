import { useMemo } from 'react';
import { ExtendedProduct } from '@/types';
import { Category } from '@/lib/dexie/categoriesDB';

interface CreatingProduct {
    categoryId: string | null;
    tempId: string;
}

export function useProductsByCategory(
    products: ExtendedProduct[],
    categories: Category[],
    creatingProduct: CreatingProduct | null
) {
    return useMemo(() => {
        const grouped = new Map<string | null, ExtendedProduct[]>();

        categories.forEach((cat) => {
            grouped.set(cat.id, []);
        });
        grouped.set(null, []);

        products.forEach((row) => {
            const categoryId = row.category_id || null;
            if (grouped.has(categoryId)) {
                grouped.get(categoryId)!.push(row);
            }
        });

        if (creatingProduct) {
            const categoryId = creatingProduct.categoryId || null;
            grouped.get(categoryId)?.push({
                id: creatingProduct.tempId,
                name: '',
                code: '',
                unit: '',
                price: 0,
                quantity: 0,
                markup_percent: 0,
                category_id: categoryId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                product_id: creatingProduct.tempId,
                deliveries: 0,
                returns: 0,
                total_loaded: 0,
                total_return: 0,
                price_with_markup: 0,
                cost: 0,
                costWithMarkup: 0,
                stock: 0,
                salesSum: 0,
                sold: 0,
                load: 0,
                return_qty: 0,
                sort_order: 0,
                initial_quantity: null
            });
        }

        grouped.forEach((group) =>
            group.sort((a, b) => {
                const orderDiff = (a.sort_order || 0) - (b.sort_order || 0);
                return orderDiff !== 0
                    ? orderDiff
                    : a.name.localeCompare(b.name);
            })
        );

        return grouped;
    }, [categories, products, creatingProduct]);
}
