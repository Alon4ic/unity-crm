// store/nameStore.ts
import { create } from 'zustand';

interface NameStore {
    names: Record<string, string>;
    setName: (productId: string, name: string) => void;
    resetNames: () => void;
}

export const useNameStore = create<NameStore>((set) => ({
    names: {},
    setName: (productId, name) =>
        set((state) => ({
            names: {
                ...state.names,
                [productId]: name,
            },
        })),
    resetNames: () => set({ names: {} }),
}));
