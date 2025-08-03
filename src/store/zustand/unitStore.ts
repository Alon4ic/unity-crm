import { create } from 'zustand';

interface UnitStoreState {
    units: Record<string, string>;
    setUnit: (productId: string, unit: string) => void;
    resetUnits: () => void;
}

export const useUnitStore = create<UnitStoreState>((set) => ({
    units: {},
    setUnit: (productId, unit) =>
        set((state) => ({
            units: {
                ...state.units,
                [productId]: unit,
            },
        })),
    resetUnits: () => set({ units: {} }),
}));
