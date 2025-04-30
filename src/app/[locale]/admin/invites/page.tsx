'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { v4 as uuidv4 } from 'uuid';
import { saveAs } from 'file-saver';
import dynamic from 'next/dynamic';

const QRCode = dynamic(
    () => import('qrcode.react').then((mod) => mod.QRCodeCanvas),
    { ssr: false }
);

export default function AdminInvitesPage() {
    const { role, setRole } = useAuthStore();
    const [invites, setInvites] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>(
        'all'
    );
    const [filterUsed, setFilterUsed] = useState<'all' | 'used' | 'unused'>(
        'all'
    );
    const [showQR, setShowQR] = useState<string | null>(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'user' | 'admin'>('user');

    useEffect(() => {
        const fetchRoleAndInvites = async () => {
            const { data, error } = await supabase.auth.getUser();
            const userRole = data?.user?.user_metadata?.role;

            if (userRole) {
                setRole(userRole);
                if (userRole === 'admin') fetchInvites();
            } else {
                console.warn('Роль пользователя не найдена в metadata', error);
            }
        };

        fetchRoleAndInvites();
    }, [setRole]);

    const fetchInvites = async () => {
        const { data, error } = await supabase
            .from('invite_codes')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setInvites(data);
        if (error) setError('Ошибка загрузки инвайтов');
    };

    const sendInviteEmail = async () => {
        setLoading(true);
        setError('');

        const code = uuidv4().slice(0, 8).toUpperCase();

        const { error: insertError } = await supabase
            .from('invite_codes')
            .insert({ code, role: inviteRole });

        if (insertError) {
            setError('Не удалось создать инвайт');
            setLoading(false);
            return;
        }

        // 👇 Сначала обновляем список инвайтов
        await fetchInvites();

        // 📬 Создаём ссылку и отправляем в API
        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const signupLink = `${appUrl}/signup?invite=${code}`;

        const response = await fetch('/api/send-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: inviteEmail, code, signupLink }),
        });

        if (!response.ok) {
            setError('Не удалось отправить email');
        }

        setLoading(false);
        setInviteEmail('');
    };

    const copyToClipboard = async (code: string) => {
        await navigator.clipboard.writeText(code);
        alert(`Код ${code} скопирован!`);
    };

    const exportCSV = () => {
        const csvContent =
            'data:text/csv;charset=utf-8,' +
            ['code,role,used']
                .concat(invites.map((i) => `${i.code},${i.role},${i.used}`))
                .join('\n');

        const blob = new Blob([decodeURIComponent(encodeURI(csvContent))], {
            type: 'text/csv;charset=utf-8;',
        });
        saveAs(blob, 'invites.csv');
    };

    const filteredInvites = invites.filter((invite) => {
        return (
            (filterRole === 'all' || invite.role === filterRole) &&
            (filterUsed === 'all' ||
                (filterUsed === 'used' ? invite.used : !invite.used))
        );
    });

    if (role !== 'admin')
        return <p className="text-center p-4">Доступ запрещён</p>;

    return (
        <div className="max-w-xl mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">Инвайт-коды</h1>

            <div className="mb-6">
                <input
                    type="email"
                    placeholder="Email для приглашения"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="input-style w-full mb-2"
                />
                <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="input-style w-full mb-2"
                >
                    <option value="user">Пользователь</option>
                    <option value="admin">Администратор</option>
                </select>
                <button
                    onClick={sendInviteEmail}
                    className="bg-primary text-white px-4 py-2 rounded"
                >
                    Отправить приглашение
                </button>
            </div>

            <div className="flex gap-4 mb-4">
                <button
                    onClick={exportCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    Экспорт в CSV
                </button>
            </div>

            <div className="flex gap-4 mb-4">
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value as any)}
                    className="border p-2 rounded"
                >
                    <option value="all">Все роли</option>
                    <option value="admin">Только админы</option>
                    <option value="user">Только пользователи</option>
                </select>
                <select
                    value={filterUsed}
                    onChange={(e) => setFilterUsed(e.target.value as any)}
                    className="border p-2 rounded"
                >
                    <option value="all">Все статусы</option>
                    <option value="used">Использованные</option>
                    <option value="unused">Не использованные</option>
                </select>
            </div>

            {loading && <p className="text-sm text-gray-500">Обработка...</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}

            <ul className="mt-4 space-y-2">
                {filteredInvites.map((invite) => (
                    <li key={invite.code} className="border p-2 rounded">
                        <div className="flex justify-between items-center">
                            <span>
                                {invite.code} ({invite.role})
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => copyToClipboard(invite.code)}
                                    className="text-sm text-blue-600 underline"
                                >
                                    Копировать
                                </button>
                                <button
                                    onClick={() => setShowQR(invite.code)}
                                    className="text-sm text-purple-600 underline"
                                >
                                    QR
                                </button>
                            </div>
                        </div>
                        <p
                            className={`text-sm ${
                                invite.used
                                    ? 'text-green-500'
                                    : 'text-yellow-500'
                            }`}
                        >
                            {invite.used ? 'использован' : 'не использован'}
                        </p>
                        {showQR === invite.code && (
                            <div className="mt-2">
                                <QRCode value={invite.code} size={128} />
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
