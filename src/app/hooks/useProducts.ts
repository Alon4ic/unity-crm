// hooks/useProducts.ts
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import { Product } from '@/types';

export interface ProductInput {
    code?: string;
    name: string;
    unit: string;
    price: number;
    quantity: number;
    extra_fields?: Record<string, string>;
}

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        if (!error) setProducts(data || []);
    };

    // Пример клиента в useProducts.ts
    const addProduct = async (product: ProductInput) => {
        setLoading(true);
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product),
            });

            const newProduct = await res.json();
            setProducts((prev) => [newProduct, ...prev]);
        } catch (err) {
            console.error('Ошибка при добавлении товара:', err);
        } finally {
            setLoading(false);
        }
    };
	const addBulkProducts = async (products: ProductInput[]) => {
        setLoading(true);
        try {
            const res = await fetch('/api/products/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(products),
            });

            const newProducts = await res.json();
            setProducts((prev) => [...newProducts, ...prev]);
        } catch (err) {
            console.error('Ошибка импорта:', err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchProducts();
    }, []);

    return { products, loading, addProduct, addBulkProducts };
};
