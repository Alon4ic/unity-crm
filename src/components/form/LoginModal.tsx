'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { supabase } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useModalStore } from '@/store/modal';
import { useAuthStore } from '@/store/authStore';
import { useTranslations } from 'next-intl';

export const LoginModal = () => {
    const t = useTranslations('auth');
    const { modal, close } = useModalStore();
    const isOpen = modal === 'login';

    const { setRole } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const router = useRouter();

    const pathname = usePathname();
    const currentLocale = pathname.split('/')[1] || 'ru';

    const handleLogin = async () => {
        setError('');
        const { data, error: loginError } =
            await supabase.auth.signInWithPassword({ email, password });

        if (loginError) {
            setError(loginError.message);
            return;
        }

        const { user } = data;
        if (!user) return;

        // Получаем роль из user_metadata
        const role = user.user_metadata?.role as 'admin' | 'user' | null;
        if (role) {
            setRole(role);
        }

        router.push(`/${currentLocale}/dashboard`);
        close();
    };

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('title_login')}</DialogTitle>
                </DialogHeader>

                <input
                    type="email"
                    placeholder={t('email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-style"
                />
                <input
                    type="password"
                    placeholder={t('password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-style"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button onClick={handleLogin} className="btn-primary">
                    {t('login')}
                </button>
            </DialogContent>
        </Dialog>
    );
};
