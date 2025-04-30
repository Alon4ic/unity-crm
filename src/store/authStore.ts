// src/store/authStore.ts
import { create } from 'zustand';

type Role = 'admin' | 'user' | null;

interface AuthState {
    role: Role;
    setRole: (role: Role) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    role: null,
    setRole: (role) => set({ role }),
}));
