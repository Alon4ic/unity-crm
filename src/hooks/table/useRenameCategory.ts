// @/hooks/table/useRenameCategory.ts
import { Category } from '@/lib/dexie/categoriesDB';
import { useState } from 'react';
import toast from 'react-hot-toast';


interface UseRenameCategoryProps {
    categories: Category[];
    updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
}

interface UseRenameCategoryReturn {
    renamingCategoryId: string | null;
    setRenamingCategoryId: React.Dispatch<React.SetStateAction<string | null>>;
    renamingCategoryName: string;
    setRenamingCategoryName: React.Dispatch<React.SetStateAction<string>>;
    newCategoryName: string;
    setNewCategoryName: React.Dispatch<React.SetStateAction<string>>;
    newColor: string;
    setNewColor: React.Dispatch<React.SetStateAction<string>>;
    handleRenameSubmit: () => void;
    handleRenameCategory: (
        id: string,
        currentName: string,
        currentColor: string
    ) => void;
}

const useRenameCategory = ({
    categories,
    updateCategory,
}: UseRenameCategoryProps): UseRenameCategoryReturn => {
    const [renamingCategoryId, setRenamingCategoryId] = useState<string | null>(
        null
    );
    const [renamingCategoryName, setRenamingCategoryName] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newColor, setNewColor] = useState('#dbd8e3');

    const handleRenameCategory = (
        id: string,
        currentName: string,
        currentColor: string
    ) => {
        setRenamingCategoryId(id);
        setRenamingCategoryName(currentName);
        setNewCategoryName(currentName);
        setNewColor(currentColor);
    };

    const handleRenameSubmit = () => {
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
    };

    return {
        renamingCategoryId,
        setRenamingCategoryId,
        renamingCategoryName,
        setRenamingCategoryName,
        newCategoryName,
        setNewCategoryName,
        newColor,
        setNewColor,
        handleRenameSubmit,
        handleRenameCategory,
    };
};

export default useRenameCategory;
