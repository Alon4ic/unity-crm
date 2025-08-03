import { create } from 'zustand';
import { ExtendedProduct } from '@/types';

type EditState = {
    editedFields: Record<string, Partial<ExtendedProduct>>;
    setField: <K extends keyof ExtendedProduct>(
        productId: string,
        key: K,
        value: ExtendedProduct[K]
    ) => void;
    getEditedProduct: (
        productId: string,
        original: ExtendedProduct
    ) => ExtendedProduct;
    resetProduct: (productId: string) => void;
};

export const useEditStore = create<EditState>((set, get) => ({
    editedFields: {},

    setField: (productId, key, value) => {
        set((state) => ({
            editedFields: {
                ...state.editedFields,
                [productId]: {
                    ...state.editedFields[productId],
                    [key]: value,
                },
            },
        }));
    },

    getEditedProduct: (productId, original) => {
        const changes = get().editedFields[productId] ?? {};
        return { ...original, ...changes };
    },

    resetProduct: (productId) => {
        set((state) => {
            const updated = { ...state.editedFields };
            delete updated[productId];
            return { editedFields: updated };
        });
    },
}));
