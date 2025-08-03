import { create } from 'zustand';

interface QuantityStore {
    quantities: Record<string, string>;
    setQuantity: (productId: string, quantity: string) => void;
    resetQuantities: () => void;
}

export const useQuantityStore = create<QuantityStore>((set) => ({
    quantities: {},
    setQuantity: (productId, quantity) =>
        set((state) => ({
            quantities: {
                ...state.quantities,
                [productId]: quantity,
            },
        })),
    resetQuantities: () => set({ quantities: {} }),
}));
