'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/lib/dexie/productsDB';

interface EditProductModalProps {
    product: Product | null;
    onClose: () => void;
    onSave: (updatedProduct: Product) => void;
}

export default function EditProductModal({
    product,
    onClose,
    onSave,
}: EditProductModalProps) {
    const [form, setForm] = useState<Product | null>(null);

    useEffect(() => {
        if (product) setForm(product);
    }, [product]);

    if (!form) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]:
                name === 'price' || name === 'quantity' ? Number(value) : value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (form) {
            onSave(form);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg shadow-md space-y-4 w-full max-w-md"
            >
                <h2 className="text-xl font-bold">Редактировать товар</h2>

                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border p-2"
                    placeholder="Название"
                    required
                />

                <input
                    type="text"
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="w-full border p-2"
                    placeholder="Единица"
                />

                <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    className="w-full border p-2"
                    placeholder="Количество"
                />

                <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full border p-2"
                    placeholder="Цена"
                />

                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Сохранить
                    </button>
                </div>
            </form>
        </div>
    );
}
