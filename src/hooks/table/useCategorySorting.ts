import { useEffect } from 'react';
import { ExtendedProduct } from '@/types';

interface UseCategorySortingProps {
    products: ExtendedProduct[];
    onBatchUpdate?: (products: ExtendedProduct[]) => Promise<void> | void;
    onEdit: (product: ExtendedProduct) => Promise<void> | void;
}

const useCategorySorting = ({
    products,
    onBatchUpdate,
    onEdit,
}: UseCategorySortingProps) => {
    useEffect(() => {
        const handleSortCategory = async (e: Event) => {
            const customEvent = e as CustomEvent;
            const { categoryId, method } = customEvent.detail;

            // Проверяем, существует ли категория в products
            const categoryExists = products.some(
                (p) => p.category_id === categoryId
            );
            if (!categoryExists) return;

            // Проверяем валидность метода сортировки
            if (!['alphabetical', 'byDate'].includes(method)) return;

            // Фильтруем продукты по категории
            const categoryProducts = products
                .filter((p) => p.category_id === categoryId)
                .slice();

            // Применяем сортировку
            if (method === 'alphabetical') {
                categoryProducts.sort((a, b) => a.name.localeCompare(b.name));
            } else if (method === 'byDate') {
                categoryProducts.sort((a, b) => {
                    // Пустые created_at в конец
                    if (!a.created_at) return 1;
                    if (!b.created_at) return -1;
                    return (
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime()
                    );
                });
            }

            // Обновляем порядок сортировки
            const updated = categoryProducts.map((p, i) => ({
                ...p,
                sort_order: i * 10,
            }));

            // Сохраняем изменения
            if (onBatchUpdate) {
                const result = onBatchUpdate(updated);
                if (result instanceof Promise) await result;
            } else {
                for (const p of updated) {
                    const result = onEdit(p);
                    if (result instanceof Promise) await result;
                }
            }
        };

        const listener = handleSortCategory as EventListener;
        window.addEventListener('sortCategory', listener);

        return () => {
            window.removeEventListener('sortCategory', listener);
        };
    }, [products, onBatchUpdate, onEdit]);
};

export default useCategorySorting;
