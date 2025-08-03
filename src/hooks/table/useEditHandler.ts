// useEditHandler.ts
import { useState, useCallback } from 'react';
import { ExtendedProduct } from '@/types/row';
import toast from 'react-hot-toast';
import { Product } from '@/lib/dexie/productsDB';

export function useEditHandler() {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<ExtendedProduct>>({});

    const handleChange = useCallback(
        (field: keyof ExtendedProduct, value: any) => {
            console.log(`handleChange: field=${field}, value=${value}`); // Отладка
            setEditData((prev) => ({ ...prev, [field]: value }));
        },
        []
    );

    const handleStartEdit = useCallback((p: ExtendedProduct) => {
        const {
            id,
            name,
            code,
            unit,
            price,
            quantity,
            markup_percent,
            category_id,
			deliveries,
			returns,
        } = p;
        setEditData({
            id,
            name,
            code,
            unit,
            price,
            quantity,
            markup_percent,
            category_id,
            deliveries: deliveries ?? 0,
            returns: returns ?? 0,
        });
        setEditingId(p.id);
    }, []);

    const handleSave = useCallback(
        async (
            mode: 'dashboard' | 'sales',
            products: ExtendedProduct[],
            onEdit: (product: Product) => void,
            onUpdate?: (p: {
                id: string;
                product_id: string;
                markup: number;
                load: number;
                return_qty: number;
				deliveries: number;
				returns: number;
            }) => void
        ) => {
            if (!editingId) return;

            const payload = { ...editData, id: editingId } as ExtendedProduct;
            const originalProduct = products.find((p) => p.id === editingId);

            if (originalProduct) {
                const initialQuantity = originalProduct.quantity ?? 0;
                const deliveries = payload.deliveries ?? 0;
                const returns = payload.returns ?? 0;
                const updatedQuantity = initialQuantity + deliveries - returns;

                payload.quantity = updatedQuantity;
            }

            if (mode === 'sales') {
                const load = payload.load ?? 0;
                const quantity = payload.quantity ?? 0;

                if (load > quantity) {
                    toast.error('Нельзя сохранить: загрузка больше остатка');
                    return;
                }

                onUpdate?.({
					id: editingId,
					product_id: payload.product_id ?? payload.id,
					markup: payload.markup_percent ?? 0,
					load,
					return_qty: payload.return_qty ?? 0,
					deliveries: payload.deliveries ?? 0,
					returns: payload.returns ?? 0,
				});
            } else {
                const savedProduct: Product = {
					id: payload.id,
					name: payload.name,
					code: payload.code,
					unit: payload.unit,
					price: payload.price,
					quantity: payload.quantity,
					markup_percent: payload.markup_percent,
					category_id: payload.category_id,
					created_at: '',
					updated_at: ''
				};
                onEdit(savedProduct);
            }

            setEditingId(null);
            setEditData({});
        },
        [editingId, editData, setEditData]
    );

    return {
        editingId,
        editData,
        handleStartEdit,
        handleSave,
        setEditData,
        setEditingId,
        handleChange, // Добавляем handleChange в возвращаемые функции
    };
}
