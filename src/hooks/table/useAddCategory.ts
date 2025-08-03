import { useCallback } from 'react';
import toast from 'react-hot-toast';

interface UseAddCategoryProps {
    addCategory: (name: string, color: string) => Promise<void>;
}

const useAddCategory = ({ addCategory }: UseAddCategoryProps) => {
    const handleAddCategory = useCallback(
        async (categoryName: string) => {
            if (!categoryName.trim()) return;

            try {
                await addCategory(categoryName.trim(), '#dbd8e3');
                toast.success('Категория добавлена');
            } catch {
                toast.error('Не удалось добавить категорию');
            }
        },
        [addCategory]
    );

    return handleAddCategory;
};

export default useAddCategory;
