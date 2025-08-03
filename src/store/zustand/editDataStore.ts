import { create } from 'zustand';

export interface EditableProductFields {
    name?: string;
    code?: string;
    unit?: string;
    price?: string;
    quantity?: string;
    deliveries?: string;
    returns?: string;
    markup_percent?: string;
    load?: string;
    return_qty?: string;
}

export interface EditData {
    [productId: string]: EditableProductFields;
}

interface EditDataState {
    editData: EditData;
    setField: (
        productId: string,
        field: keyof EditableProductFields,
        value: string
    ) => void;
    mergeEditData: (data: EditData) => void;
    resetEditData: () => void;
    saveEditData: (productId: string) => void; // Новый метод для сохранения
}

export const useEditDataStore = create<EditDataState>((set, get) => ({
    editData: {},
    setField: (productId, field, value) =>
        set((state) => ({
            editData: {
                ...state.editData,
                [productId]: {
                    ...state.editData[productId],
                    [field]: value,
                },
            },
        })),
    mergeEditData: (newData) =>
        set((state) => {
            const merged: EditData = { ...state.editData };
            for (const [id, fields] of Object.entries(newData)) {
                merged[id] = { ...merged[id], ...fields };
            }
            return { editData: merged };
        }),
    resetEditData: () => set({ editData: {} }),
    saveEditData: (productId) =>
        set((state) => {
            const currentEditData = state.editData[productId] || {};
            // Здесь можно добавить логику сохранения (например, вызов API)
            // После сохранения очищаем данные для productId
            const { [productId]: _, ...rest } = state.editData;
            return { editData: rest };
        }),
}));
