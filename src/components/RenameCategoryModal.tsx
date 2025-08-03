// @/components/RenameCategoryModal.tsx
import React from 'react';

interface RenameCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    newCategoryName: string;
    setNewCategoryName: (value: string) => void;
    newColor: string;
    setNewColor: (color: string) => void;
    onSubmit: () => void;
    colorOptions?: string[];
}

const RenameCategoryModal: React.FC<RenameCategoryModalProps> = ({
    isOpen,
    onClose,
    newCategoryName,
    setNewCategoryName,
    newColor,
    setNewColor,
    onSubmit,
    colorOptions = ['#fef08a', '#a5f3fc', '#86efac', '#fca5a5', '#ddd6fe'],
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-full max-w-md">
                <h2 className="text-lg font-bold mb-2">
                    Редактирование категории
                </h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Название:
                    </label>
                    <input
                        className="w-full p-2 border rounded"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                        Цвет:
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        {colorOptions.map((color) => (
                            <button
                                key={color}
                                onClick={() => setNewColor(color)}
                                className={`w-8 h-8 rounded-full border-2 ${
                                    color === newColor
                                        ? 'border-blue-500'
                                        : 'border-transparent'
                                }`}
                                style={{ backgroundСolor: color }}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 bg-gray-400 rounded"
                        onClick={onClose}
                    >
                        Отмена
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                        onClick={onSubmit}
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RenameCategoryModal;
