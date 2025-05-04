'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { saveProduct } from '@/lib/saveProduct';
import { toast } from 'react-hot-toast';
import ProductForm from '@/components/form/ProductForm';
import ProductTable from '@/components/ProductTable';


export default function DashboardPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*');
        if (data) setProducts(data);
    };

    const handleAddProduct = async (newProduct: any) => {
        setLoading(true);
        const result = await saveProduct(newProduct);
        setLoading(false);

        if (result.success) {
            fetchProducts();
            toast.success('✅ Товар успешно добавлен!');
        } else {
            console.error('Ошибка добавления товара:', result.error);
            toast.error('❌ Ошибка при добавлении товара');
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Ваш склад</h1>

            {products.length === 0 ? (
                <div className="text-center p-8 bg-yellow-50 rounded-lg">
                    <p className="text-lg font-semibold mb-4">
                        У вас на складе нет товаров
                    </p>
                    <p className="text-sm text-gray-700 mb-6">
                        Вы можете внести товар вручную или импортировать список
                        из таблицы XLSX.
                    </p>
                </div>
            ) : (
                <ProductTable products={products} />
            )}

            <h2 className="text-lg font-bold mb-4">Добавить товар вручную</h2>

            <ProductForm onAdd={handleAddProduct} loading={loading} />
        </div>
    );
}
