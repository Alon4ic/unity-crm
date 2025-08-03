// @/hooks/table/useSaveProduct.ts
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { ExtendedProduct } from '@/types';
import { LoadTransaction } from '@/types';

interface UseSaveProductProps {
    editingId: string | null;
    creatingProduct: { categoryId: string | null; tempId: string } | null;
    mode: 'dashboard' | 'sales';
    productMap: Record<string, ExtendedProduct>;
    onUpdate?: (p: {
        id: string;
        product_id: string;
        markup: number;
        load: number;
        return_qty: number;
        created_at: string;
    }) => void;
    onEdit: (product: ExtendedProduct) => Promise<void>;
    fetchProducts: () => Promise<void>;
    setEditingId: (id: string | null) => void;
    setCreatingProduct: (
        product: { categoryId: string | null; tempId: string } | null
    ) => void;
    setEditDataMap: React.Dispatch<
        React.SetStateAction<Record<string, Partial<ExtendedProduct>>>
    >;
}

const useSaveProduct = (props: UseSaveProductProps) => {
    const {
        editingId,
        creatingProduct,
        mode,
        productMap,
        onUpdate,
        onEdit,
        fetchProducts,
        setEditingId,
        setCreatingProduct,
        setEditDataMap,
    } = props;

    const handleSave = useCallback(
        async (payload: ExtendedProduct) => {
            if (!editingId && !creatingProduct) return;

            const finalPayload = {
                ...payload,
                id: editingId || creatingProduct?.tempId,
                category_id:
                    payload.category_id || creatingProduct?.categoryId || null,
                deliveries:
                    mode === 'dashboard' ? Number(payload.deliveries ?? 0) : 0,
                returns:
                    mode === 'dashboard' ? Number(payload.returns ?? 0) : 0,
                load: mode === 'sales' ? Number(payload.load ?? 0) : 0,
                return_qty:
                    mode === 'sales' ? Number(payload.return_qty ?? 0) : 0,
                background_color: payload.background_color || undefined,
            } as ExtendedProduct;

            if (mode === 'sales') {
                const load = Number(payload.load ?? 0);
                const return_qty = Number(payload.return_qty ?? 0);
                const productId = (editingId ??
                    creatingProduct?.tempId) as string;
                const currentQuantity = Number(
                    productMap[productId]?.quantity ?? 0
                );

                const shouldSaveColor =
                    payload.background_color &&
                    payload.background_color !==
                        productMap[productId]?.background_color;

                if (load > 0 || return_qty > 0 || shouldSaveColor) {
                    if (load > currentQuantity) {
                        toast.error(
                            'Нельзя сохранить: загрузка больше остатка'
                        );
                        return;
                    }

                    if (load > 0 || return_qty > 0) {
                        onUpdate?.({
                            product_id: finalPayload.id,
                            markup: finalPayload.markup_percent ?? 0,
                            load,
                            return_qty,
                            id: '',
                            created_at: '',
                        });

                        const newQuantity = currentQuantity - load + return_qty;
                        if (newQuantity < 0) {
                            toast.error('Остаток не может быть отрицательным');
                            return;
                        }
                    }

                    await onEdit({
                        ...finalPayload,
                        quantity:
                            load > 0 || return_qty > 0
                                ? currentQuantity - load + return_qty
                                : finalPayload.quantity,
                        load: 0,
                        return_qty: 0,
                    });
                }
            } else {
                await onEdit({
                    ...finalPayload,
                    quantity: Number(finalPayload.quantity ?? 0),
                    deliveries: 0,
                    returns: 0,
                });
            }

            setEditingId(null);
            setCreatingProduct(null);
            setEditDataMap((prev) => {
                const newMap = { ...prev };
                delete newMap[finalPayload.id];
                return newMap;
            });

            await fetchProducts();
        },
        [
            editingId,
            creatingProduct,
            mode,
            productMap,
            onUpdate,
            onEdit,
            fetchProducts,
            setEditingId,
            setCreatingProduct,
            setEditDataMap,
        ]
    );

    return handleSave;
};

export default useSaveProduct;
