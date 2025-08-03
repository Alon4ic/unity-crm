import { create } from 'zustand';

interface PriceWithMarkupStore {
    values: Record<string, string>;
    setValue: (productId: string, value: string) => void;
    resetValue: (productId: string) => void;
    resetAll: () => void;
    getValue: (productId: string, original: string) => string;
}

export const priceWithMarkupStore = create<PriceWithMarkupStore>(
    (set, get) => ({
        values: {},

        setValue: (productId, value) =>
            set((state) => ({
                values: {
                    ...state.values,
                    [productId]: value,
                },
            })),

        resetValue: (productId) =>
            set((state) => {
                const updated = { ...state.values };
                delete updated[productId];
                return { values: updated };
            }),

        resetAll: () => set({ values: {} }),

        getValue: (productId, original) => {
            const value = get().values[productId];
            return value !== undefined ? value : original;
        },
    })
);
