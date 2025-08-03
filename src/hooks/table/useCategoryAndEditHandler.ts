// useCategoryAndEditHandler.ts
import { useState, useCallback } from 'react';
import { ExtendedProduct } from '@/types/row';
import toast from 'react-hot-toast';

interface CategoryResult {
    id: any;
    name: any;
    color: any;
    created_at: any;
}

export function useCategoryAndEditHandler() {
    const [newCategory, setNewCategory] = useState('');
    const [editData, setEditData] = useState<Partial<ExtendedProduct>>({});

    const handleChange = useCallback(
        (field: keyof ExtendedProduct, value: any) => {
            setEditData((prev) => ({ ...prev, [field]: value }));
        },
        [setEditData]
    );

    const handleCancel = useCallback(() => {
        setEditData({});
    }, [setEditData]);

    const handleAddCategory = useCallback(
        async (
            e: React.FormEvent,
            addCategory: (
                name: string,
                color: string
            ) => Promise<CategoryResult | undefined>
        ) => {
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
        [newCategory]
    );

    return {
        newCategory,
        setNewCategory,
        editData,
        setEditData,
        handleChange,
        handleCancel,
        handleAddCategory,
    };
}
