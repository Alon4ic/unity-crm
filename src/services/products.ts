// src/services/products.ts
import { supabase } from '@/lib/supabase/client';
import { Product } from '@/types';

// Получить все товары
export const getProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
        console.error('Ошибка загрузки товаров:', error);
        throw new Error(error.message);
    }
    return data || [];
};

// Добавить товар
export const addProduct = async (product: {
    name_code: string;
    unit_id: number;
    price: number;
    quantity?: number;
}): Promise<Product | null> => {
    const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select();

    if (error) {
        console.error('Ошибка добавления товара:', error);
        throw new Error(error.message);
    }

    return data && data.length > 0 ? data[0] : null;
};

// Обновить товар
export const updateProduct = async (
    id: number,
    product: {
        name_code: string;
        unit_id: number;
        price: number;
        quantity?: number;
    }
): Promise<Product | null> => {
    const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Ошибка обновления товара:', error);
        throw new Error(error.message);
    }

    return data;
};

// Удалить товар
export const deleteProduct = async (id: number): Promise<void> => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
        console.error('Ошибка удаления товара:', error);
        throw new Error(error.message);
    }
};
