// @/hooks/table/useDeleteCategory.ts
import { useCallback } from 'react';
import toast from 'react-hot-toast';

// Обновленный интерфейс с правильной сигнатурой
interface UseDeleteCategoryProps {
    deleteCategory: (
        id: string,
        fetchProducts: () => Promise<void>
    ) => Promise<void>;
    fetchProducts: () => Promise<void>;
    confirmMessage?: string;
}

const useDeleteCategory = ({
    deleteCategory,
    fetchProducts,
    confirmMessage = 'Удалить категорию? Товары останутся без категории.',
}: UseDeleteCategoryProps) => {
    const handleDeleteCategory = useCallback(
        async (id: string) => {
            if (!confirm(confirmMessage)) return;

            try {
                // Вызываем с обязательным вторым аргументом
                await deleteCategory(id, fetchProducts);
                toast.success('Категория удалена');
            } catch (err: any) {
                console.error('Ошибка при удалении:', err);
                toast.error(`Неизвестная ошибка`);
            }
        },
        [deleteCategory, fetchProducts, confirmMessage]
    );

    return handleDeleteCategory;
};

export default useDeleteCategory;
