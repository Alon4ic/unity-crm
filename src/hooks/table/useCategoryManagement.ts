import { useCallback } from 'react';
import { ExtendedProduct} from '@/types';
import toast from 'react-hot-toast';
import { Category } from '@/lib/dexie/categoriesDB';

interface UseCategoryDropProps {
    products: ExtendedProduct[];
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
    categories: Category[];
    onEdit: (product: ExtendedProduct) => Promise<void>;
    onBatchUpdate?: (products: ExtendedProduct[]) => Promise<void>;
    fetchProducts: () => Promise<void>;
    resetSelection?: () => void;
}

export function useCategoryDrop({
    products,
    selectedIds,
    setSelectedIds,
    categories,
    onEdit,
    onBatchUpdate,
    fetchProducts,
    resetSelection,
}: UseCategoryDropProps) {
    const handleCategoryDrop = useCallback(
        async (productId: string, newCategoryId: string | null) => {
            try {
                const productIdsToMove = selectedIds.includes(productId)
                    ? selectedIds
                    : [productId];

                const filteredProducts = products.filter((p) =>
                    productIdsToMove.includes(p.id)
                );

                if (
                    filteredProducts.every(
                        (p) => p.category_id === newCategoryId
                    )
                ) {
                    return;
                }

                const updated = filteredProducts.map((p, index) => ({
                    ...p,
                    category_id: newCategoryId,
                    sort_order: index * 10,
                }));

                if (onBatchUpdate) {
                    await onBatchUpdate(updated);
                    resetSelection?.();

                } else {
                    for (const p of updated) {
                        await onEdit(p);
                    }
                }

                toast.success(
                    `Перемещено ${updated.length} товар(ов) в категорию "${
                        categories.find((c) => c.id === newCategoryId)?.name ||
                        'Без категории'
                    }"`
                );

                setSelectedIds([]);
                await fetchProducts();
            } catch (err) {
                console.error('Ошибка при перемещении категории:', err);
                toast.error('Ошибка при перемещении товара');
            }
        },
        [
            products,
            selectedIds,
            setSelectedIds,
            categories,
            onEdit,
            onBatchUpdate,
            fetchProducts,
        ]
    );

    return {
        handleCategoryDrop,
    };
}
