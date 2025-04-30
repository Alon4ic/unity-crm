import { create } from 'zustand';

interface ProductStore {
    refresh: boolean;
    triggerRefresh: () => void;
}

export const useProductStore = create<ProductStore>((set) => ({
    refresh: false,
    triggerRefresh: () => set((state) => ({ refresh: !state.refresh })),
}));
