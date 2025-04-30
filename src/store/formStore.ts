import { create } from 'zustand';

type FormState = {
    inviteCode: string;
    setInviteCode: (code: string) => void;
};

export const useFormStore = create<FormState>((set) => ({
    inviteCode: '',
    setInviteCode: (code) => set({ inviteCode: code }),
}));
