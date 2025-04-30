import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { saveProduct } from '@/lib/saveProduct';
import { supabase } from '@/lib/supabase/client';
import { syncUnsyncedProducts } from '@/lib/syncUnsyncedProducts.client.ts';


export interface Product {
    id: string;
    code: string | null;
    name: string;
    unit: string;
    price: number;
    quantity: number;
    created_at: string;
}

export interface ProductInput {
    code?: string;
    name: string;
    unit: string;
    price: number;
    quantity: number;
}

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const fetchProducts = async () => {
        try {
            setFetching(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            toast.error('❌ Не удалось загрузить товары');
            console.error('Ошибка загрузки:', error);
        } finally {
            setFetching(false);
        }
    };

    const addProduct = async (newProduct: ProductInput) => {
        try {
            setLoading(true);
            const result = await saveProduct(newProduct);
            if (!result.success) throw new Error(result.error);

            if (result.data) {
                setProducts((prev) => [result.data as unknown as Product, ...prev]);
                toast.success('✅ Товар добавлен!');
            }
        } catch (error) {
            console.error('Ошибка добавления:', error);
            toast.error('❌ Ошибка при добавлении товара');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        const trySync = async () => {
            if (navigator.onLine) {
                await syncUnsyncedProducts();
            }
        };
        window.addEventListener('online', trySync);
        trySync();
        return () => window.removeEventListener('online', trySync);
    }, []);

    return { products, loading, fetching, addProduct };
};
