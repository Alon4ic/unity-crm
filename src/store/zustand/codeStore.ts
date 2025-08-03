import { create } from 'zustand';

interface CodeStore {
    codes: Record<string, string>;
    setCode: (productId: string, code: string) => void;
    resetCode: (productId: string) => void;
    resetAll: () => void;
    getCode: (productId: string, original: string) => string;
}

export const useCodeStore = create<CodeStore>((set, get) => ({
    codes: {},

    setCode: (productId, code) =>
        set((state) => ({
            codes: {
                ...state.codes,
                [productId]: code,
            },
        })),

    resetCode: (productId) =>
        set((state) => {
            const updated = { ...state.codes };
            delete updated[productId];
            return { codes: updated };
        }),

    resetAll: () => set({ codes: {} }),

    getCode: (productId, original) => {
        const value = get().codes[productId];
        return value !== undefined ? value : original;
    },
}));
