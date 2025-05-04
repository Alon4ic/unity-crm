'use client';

import { useState } from 'react';

interface ProductFormProps {
    onAdd: (product: any) => Promise<void>;
    loading: boolean;
}

export default function ProductForm({ onAdd, loading }: ProductFormProps) {
    const [form, setForm] = useState({
        code: '',
        name: '',
        unit: '',
        quantity: '',
        price: '',    
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) return;
        await onAdd({
            code: form.code || undefined,
            name: form.name,
            unit: form.unit || 'шт',
            price: parseFloat(form.price) || 0,
            quantity: parseInt(form.quantity) || 0,
        });
        setForm({ code: '', name: '', unit: '', quantity: '', price: '' });
    };

    return (
        <div className="grid grid-cols-5 gap-4 mb-6">
            <input
                name="code"
                placeholder="Код товара"
                value={form.code}
                onChange={handleChange}
                className="border p-2 rounded"
            />
            <input
                name="name"
                placeholder="Название товара"
                value={form.name}
                onChange={handleChange}
                className="border p-2 rounded"
            />
            <input
                name="unit"
                placeholder="Единица (шт, кг...)"
                value={form.unit}
                onChange={handleChange}
                className="border p-2 rounded"
            />
            <input
                name="quantity"
                placeholder="Количество"
                value={form.quantity}
                onChange={handleChange}
                className="border p-2 rounded"
            />
            <input
                name="price"
                placeholder="Цена"
                value={form.price}
                onChange={handleChange}
                className="border p-2 rounded"
            />
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full col-span-5 flex justify-center items-center gap-2 mt-2"
            >
                {loading ? (
                    <>
                        <span className="loader border-white" />
                        <span>Добавление...</span>
                    </>
                ) : (
                    'Добавить товар'
                )}
            </button>
        </div>
    );
}
