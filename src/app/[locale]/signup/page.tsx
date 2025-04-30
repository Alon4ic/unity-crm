'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useModalStore } from '@/store/modal';
import { useFormStore } from '@/store/formStore'; // ← создадим или используем хранилище формы
import { RegisterModal } from '@/components/form/RegisterForm';

export default function SignupPage() {
    const searchParams = useSearchParams();
    const { open } = useModalStore();
    const invite = searchParams.get('invite');
    const setInviteCode = useFormStore((state) => state.setInviteCode); // 👈

    useEffect(() => {
        if (invite) {
            setInviteCode(invite); // записываем invite-код в Zustand
            open('signup'); // открываем модалку
        }
    }, [invite, open, setInviteCode]);

    return <RegisterModal />;
}
