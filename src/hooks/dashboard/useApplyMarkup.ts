
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '@/lib/dexie/productsDB';
import { supabase } from '@/lib/supabase/client';
import { ExtendedProduct } from '@/types';
import { toProduct } from '@/utils/productUtils';

interface UseApplyMarkupOptions {
    products: ExtendedProduct[];
    setProducts: (products: ExtendedProduct[]) => void;
}

export function useApplyMarkup({
    products,
    setProducts,
}: UseApplyMarkupOptions) {
    const [isApplying, setIsApplying] = useState(false);

    const applyMarkup = async (markup: string, selectedProductId?: string) => {
        if (!markup || isNaN(Number(markup)) || Number(markup) < 0) {
            toast.error('Введите корректную положительную наценку');
            return;
        }

        setIsApplying(true);
        const percent = Number(markup);

        try {
            const updatedProducts = selectedProductId
                ? products.map((p) =>
                      p.id === selectedProductId
                          ? { ...p, markup_percent: percent }
                          : p
                  )
                : products.map((p) => ({ ...p, markup_percent: percent }));

            setProducts(updatedProducts);
            await db.products.bulkPut(updatedProducts.map(toProduct));

            const { error } = await supabase
                .from('products')
                .upsert(updatedProducts.map(toProduct), {
                    onConflict: 'id',
                    ignoreDuplicates: false,
                });

            if (error) throw error;

            toast.success(
                selectedProductId
                    ? 'Наценка применена к выбранному товару'
                    : 'Наценка применена ко всем товарам'
            );
        } catch (err: any) {
            console.error('Ошибка при применении наценки:', err);
            toast.error(`❌ ${err.message || 'Неизвестная ошибка'}`);
        } finally {
            setIsApplying(false);
        }
    };

    return { applyMarkup, isApplying };
}
