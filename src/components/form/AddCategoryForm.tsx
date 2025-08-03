import React, { useState } from 'react';

interface AddCategoryFormProps {
    onSubmit: (categoryName: string) => void;
    colSpan: number;
}

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({
    onSubmit,
    colSpan,
}) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onSubmit(inputValue.trim());
            setInputValue('');
        }
    };

    return (
        <tr>
            <td colSpan={colSpan} className="border p-2 bg-gray-900">
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Укажите категорию"
                        className="p-1 border rounded w-full"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                </form>
            </td>
        </tr>
    );
};

export default React.memo(AddCategoryForm);
