import { useState, useCallback } from 'react';
import { useCategories } from '@/hooks/useCategories';
import toast from 'react-hot-toast';

export function useCategoryManagement(fetchProducts: () => Promise<void>) {
    const [newCategory, setNewCategory] = useState('');
    const [renamingCategoryId, setRenamingCategoryId] = useState<string | null>(
        null
    );
    const [renamingCategoryName, setRenamingCategoryName] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newColor, setNewColor] = useState('#dbd8e3');

    const colorOptions = [
        '#fef08a',
        '#a5f3fc',
        '#86efac',
        '#fca5a5',
        '#ddd6fe',
    ];

    const { categories, addCategory, updateCategory, deleteCategory } =
        useCategories();

    const handleAddCategory = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!newCategory.trim()) return;

            try {
                await addCategory(newCategory.trim(), '#dbd8e3');
                setNewCategory('');
                toast.success('Категория добавлена');
            } catch {
                toast.error('Не удалось добавить категорию');
            }
        },
        [newCategory, addCategory]
    );

    const handleRenameCategory = useCallback(
        (id: string, currentName: string, currentColor: string) => {
            setRenamingCategoryId(id);
            setRenamingCategoryName(currentName);
            setNewCategoryName(currentName);
            setNewColor(currentColor);
        },
        []
    );

    const handleRenameSubmit = useCallback(() => {
        if (!renamingCategoryId) return;

        const originalCategory = categories.find(
            (c) => c.id === renamingCategoryId
        );
        if (!originalCategory) return;

        const updates: Partial<{ name: string; color: string }> = {};

        if (newCategoryName !== originalCategory.name) {
            updates.name = newCategoryName;
        }

        if (newColor !== originalCategory.color) {
            updates.color = newColor;
        }

        if (Object.keys(updates).length === 0) {
            setRenamingCategoryId(null);
            return;
        }

        updateCategory(renamingCategoryId, updates)
            .then(() => {
                toast.success('Изменения сохранены');
                setRenamingCategoryId(null);
                setNewCategoryName('');
                setNewColor('#dbd8e3');
            })
            .catch(() => {
                toast.error('Ошибка при обновлении');
                setNewCategoryName(originalCategory.name);
            });
    }, [
        renamingCategoryId,
        categories,
        newCategoryName,
        newColor,
        updateCategory,
    ]);

    const handleDeleteCategory = useCallback(
        async (id: string) => {
            if (!confirm('Удалить категорию? Товары останутся без категории.'))
                return;

            try {
                await deleteCategory(id, fetchProducts);
                toast.success('Категория удалена');
            } catch (err: any) {
                console.error('Ошибка при удалении:', err);
                toast.error(`Ошибка: ${err.message || 'Неизвестная ошибка'}`);
            }
        },
        [deleteCategory, fetchProducts]
    );

    return {
        newCategory,
        setNewCategory,
        renamingCategoryId,
        setRenamingCategoryId,
        renamingCategoryName,
        setRenamingCategoryName,
        newCategoryName,
        setNewCategoryName,
        newColor,
        setNewColor,
        colorOptions,
        categories,
        handleAddCategory,
        handleRenameCategory,
        handleRenameSubmit,
        handleDeleteCategory,
    };
}
