'use client';

import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useModalStore } from '@/store/modal';
import { supabase } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useFormStore } from '@/store/formStore';

export const RegisterModal = () => {
    const t = useTranslations('auth');
    const { modal, close } = useModalStore();
    const isOpen = modal === 'signup';
    const router = useRouter();
    const inviteCodeFromStore = useFormStore((state) => state.inviteCode);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        inviteCode: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const pathname = usePathname();
    const currentLocale = pathname.split('/')[1] || 'ru';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async () => {
        setError('');
        setLoading(true);

        // Проверка инвайта
        const { data: invite, error: inviteError } = await supabase
            .from('invite_codes')
            .select('role')
            .eq('code', form.inviteCode)
            .eq('used', false)
            .single();

        if (!invite || inviteError) {
            setError('Неверный или использованный инвайт-код');
            setLoading(false);
            return;
        }

        // Регистрация
        const { data: signUpData, error: signUpError } =
            await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        first_name: form.firstName,
                        last_name: form.lastName,
                        role: invite.role,
                    },
                },
            });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        const userId = signUpData?.user?.id;

        // Обновляем invite
        await supabase
            .from('invite_codes')
            .update({ used: true })
            .eq('code', form.inviteCode);

        // Создаём профиль
        if (userId) {
            await supabase.from('profiles').insert({
                id: userId,
                first_name: form.firstName,
                last_name: form.lastName,
            });
        }

        setLoading(false);
        router.push(`/${currentLocale}/dashboard`);
        close();
    };
    useEffect(() => {
        if (inviteCodeFromStore) {
            setForm((prev) => ({ ...prev, inviteCode: inviteCodeFromStore }));
        }
    }, [inviteCodeFromStore]);

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('title_register')}</DialogTitle>
                </DialogHeader>

                <input
                    name="firstName"
                    placeholder={t('first_name')}
                    value={form.firstName}
                    onChange={handleChange}
                    className="input-style"
                />
                <input
                    name="lastName"
                    placeholder={t('last_name')}
                    value={form.lastName}
                    onChange={handleChange}
                    className="input-style"
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="input-style"
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Пароль"
                    value={form.password}
                    onChange={handleChange}
                    className="input-style"
                />
                <input
                    name="inviteCode"
                    placeholder="Инвайт-код"
                    value={form.inviteCode}
                    onChange={handleChange}
                    className="input-style"
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    onClick={handleRegister}
                    className="btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
            </DialogContent>
        </Dialog>
    );
};
