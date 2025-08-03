import { useState, useEffect, useCallback } from 'react';
import { ExtendedProduct } from '@/types';

const STORAGE_KEY = 'productRowColors';

export function useRowColors(products: ExtendedProduct[]) {
    const [rowColors, setRowColors] = useState<Record<string, string>>({});

    // Загрузка из localStorage + из product.backgroundСolor
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        const storedColors: Record<string, string> = saved
            ? JSON.parse(saved)
            : {};

        const mergedColors: Record<string, string> = {};

        for (const product of products) {
            const fromProduct = product.backgroundСolor;
            const fromStorage = storedColors[product.id];
            mergedColors[product.id] = fromProduct ?? fromStorage ?? '';
        }

        // Проверяем, изменился ли объект цветов
        const isEqual =
            Object.keys(mergedColors).length ===
                Object.keys(rowColors).length &&
            Object.keys(mergedColors).every(
                (key) => mergedColors[key] === rowColors[key]
            );

        if (!isEqual) {
            setRowColors(mergedColors);
        }
    }, [products]);

    // Сохранение в localStorage при изменении
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rowColors));
    }, [rowColors]);

    const handleColorChange = useCallback(
        (productId: string, color: string) => {
            setRowColors((prev) => ({ ...prev, [productId]: color }));
        },
        []
    );

    return { rowColors, handleColorChange };
}
