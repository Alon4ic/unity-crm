// src/store/modalStore.ts
import { create } from 'zustand';

type ModalType = 'login' | 'signup' | null;

interface ModalStore {
    modal: ModalType;
    open: (modal: ModalType) => void;
    close: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
    modal: null,
    open: (modal) => set({ modal }),
    close: () => set({ modal: null }),
}));
