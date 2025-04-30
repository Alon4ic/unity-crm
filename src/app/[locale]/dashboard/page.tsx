'use client';

import { useProducts } from '@/app/hooks/useProducts';
import { ProductTable } from '@/components/ProductTable';
import { ProductForm } from '@/components/form/ProductForm';

export default function DashboardPage() {
    const { products, fetching, loading, addProduct } = useProducts();

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Управление товарами</h1>
            {fetching ? (
                <div className="text-center p-4 text-gray-500">Загрузка...</div>
            ) : (
                <>
                    <ProductTable products={products} />
                    <ProductForm onAdd={addProduct} loading={loading} />
                </>
            )}
        </div>
    );
}
