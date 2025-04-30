import { ProductInput } from '@/app/hooks/useProducts';
import { useState } from 'react';


export const ProductForm = ({
    onAdd,
    loading,
}: {
    onAdd: (product: ProductInput) => void;
    loading: boolean;
}) => {
    const [form, setForm] = useState({
        code: '',
        name: '',
        unit: 'шт',
        price: '',
        quantity: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (!form.name.trim()) return;
        onAdd({
            code: form.code.trim() || undefined,
            name: form.name.trim(),
            unit: form.unit || 'шт',
            price: Number(form.price) || 0,
            quantity: Number(form.quantity) || 0,
        });

        setForm({
            code: '',
            name: '',
            unit: 'шт',
            price: '',
            quantity: '',
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Добавить новый товар</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Код"
                />
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="input-field md:col-span-2"
                    placeholder="Название*"
                />
                <input
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Ед. изм."
                />
                <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Цена"
                />
                <input
                    name="quantity"
                    type="number"
                    value={form.quantity}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Количество"
                />
            </div>
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            >
                {loading ? 'Добавление...' : 'Добавить товар'}
            </button>
        </div>
    );
};

// 'use client';

// import { useState } from 'react';

// interface ProductFormProps {
//     onAdd: (product: any) => Promise<void>;
//     loading: boolean;
// }

// export default function ProductForm({ onAdd, loading }: ProductFormProps) {
//     const [form, setForm] = useState({
//         code: '',
//         name: '',
//         unit: '',
//         quantity: '',
//         price: '',
//     });

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setForm({ ...form, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async () => {
//         if (!form.name.trim()) return;
//         await onAdd({
//             code: form.code || undefined,
//             name: form.name,
//             unit: form.unit || 'шт',
//             price: parseFloat(form.price) || 0,
//             quantity: parseInt(form.quantity) || 0,
//         });
//         setForm({ code: '', name: '', unit: '', quantity: '', price: '' });
//     };

//     return (
//         <div className="grid grid-cols-5 gap-4 mb-6">
//             <input
//                 name="code"
//                 placeholder="Код товара"
//                 value={form.code}
//                 onChange={handleChange}
//                 className="border p-2 rounded"
//             />
//             <input
//                 name="name"
//                 placeholder="Название товара"
//                 value={form.name}
//                 onChange={handleChange}
//                 className="border p-2 rounded"
//             />
//             <input
//                 name="unit"
//                 placeholder="Единица (шт, кг...)"
//                 value={form.unit}
//                 onChange={handleChange}
//                 className="border p-2 rounded"
//             />
//             <input
//                 name="quantity"
//                 placeholder="Количество"
//                 value={form.quantity}
//                 onChange={handleChange}
//                 className="border p-2 rounded"
//             />
//             <input
//                 name="price"
//                 placeholder="Цена"
//                 value={form.price}
//                 onChange={handleChange}
//                 className="border p-2 rounded"
//             />
//             <button
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 className="btn-primary w-full col-span-5 flex justify-center items-center gap-2 mt-2"
//             >
//                 {loading ? (
//                     <>
//                         <span className="loader border-white" />
//                         <span>Добавление...</span>
//                     </>
//                 ) : (
//                     'Добавить товар'
//                 )}
//             </button>
//         </div>
//     );
// }
