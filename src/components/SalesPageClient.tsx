'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createManager } from '@/lib/actions/createManager';
import SessionLine from './SessionLine';
import { AnimatePresence, motion } from 'framer-motion';
import { useSalePages } from '@/hooks/useSalePages';

interface Session {
    id: string;
    started_at: string;
    ended_at: string | null;
    total_sales_sum: number | null;
}

interface Page {
    id: string;
    name: string;
    created_at: string | null;
    is_archived: boolean;
    sessions?: Session[];
}

interface Props {
    pages: Page[];
    locale: string;
}

export default function SalesPageClient({ pages: serverPages, locale }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [sessionsShown, setSessionsShown] = useState<Record<string, number>>(
        {}
    );
    const [deletingPageId, setDeletingPageId] = useState<string | null>(null);

    const { pages, activePages, archivedPages, setPages } = useSalePages(
        serverPages,
        showArchived
    );

    const handleCreate = async () => {
        if (!name.trim()) {
            toast.error('Введите имя для страницы');
            return;
        }

        try {
            const mgr = await createManager(name);

            toast.success(`Создана страница: ${mgr.name}`);
            setName('');
            setOpen(false);
            setPages((prev) => [
                ...prev,
                {
                    id: mgr.id,
                    name: mgr.name,
                    created_at: mgr.created_at,
                    is_archived: false,
                    sessions: [],
                },
            ]);
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || 'Ошибка создания');
        }
    };

    // Функция удаления страницы
    const handleDelete = async (page: Page) => {
        if (!page.id) return;

        setDeletingPageId(page.id);
        try {
            // Удаление на сервере (если онлайн)
            if (navigator.onLine) {
                const res = await fetch('/api/delete-page', {
                    method: 'DELETE',
                    body: JSON.stringify({ id: page.id }),
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Ошибка удаления');
                }
            }

            // Удаление из локальной базы
            const { db } = await import('@/lib/dexie/productsDB');
            await db.sale_pages.delete(page.id);

            // Обновление состояния
            setPages((prev) => prev.filter((p) => p.id !== page.id));
            toast.success('Страница удалена');
        } catch (err: any) {
            toast.error(err.message || 'Ошибка удаления страницы');
        } finally {
            setDeletingPageId(null);
            router.refresh();
        }
    };

    const toggleArchive = async (page: Page, archive: boolean) => {
        const endpoint = archive ? '/api/archive-page' : '/api/unarchive-page';
        const res = await fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({ id: page.id }),
        });

        if (!res.ok) {
            const err = await res.json();
            toast.error(err.error || 'Ошибка');
            return;
        }

        setPages((prev) =>
            prev.map((p) =>
                p.id === page.id ? { ...p, is_archived: archive } : p
            )
        );

        const { db } = await import('@/lib/dexie/productsDB');
        await db.sale_pages.update(page.id, { is_archived: archive });

        toast.success(
            archive ? 'Страница архивирована' : 'Страница восстановлена'
        );
        router.refresh();
    };

    const getShownSessions = (pageId: string, allSessions: Session[]) => {
        const shownCount = sessionsShown[pageId] ?? 2;
        return [...allSessions]
            .sort(
                (a, b) =>
                    new Date(b.started_at).getTime() -
                    new Date(a.started_at).getTime()
            )
            .slice(0, shownCount);
    };

    const handleShowMore = (pageId: string) => {
        setSessionsShown((prev) => ({
            ...prev,
            [pageId]: (prev[pageId] ?? 2) + 5,
        }));
    };

    return (
        <div className="p-4 space-y-6">
            {/* верхняя панель */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">Страницы продаж</h1>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => setShowArchived((v) => !v)}
                    >
                        {showArchived ? 'Скрыть архивные' : 'Показать архивные'}
                    </Button>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">Создать страницу</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    Создать новую страницу продаж
                                </DialogTitle>
                            </DialogHeader>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Введите имя, например «Редько Елена»"
                            />
                            <DialogFooter>
                                <Button
                                    onClick={() => setOpen(false)}
                                    variant="outline"
                                >
                                    Отмена
                                </Button>
                                <Button onClick={handleCreate}>Создать</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* активные страницы */}
            <h2 className="text-sm font-semibold text-muted-foreground">
                Активные
            </h2>
            <ul className="space-y-2">
                {activePages.map((page) => (
                    <li
                        key={page.id}
                        className="border p-3 rounded hover:bg-muted/50 transition"
                    >
                        <Link
                            href={`/${locale}/sales/${page.id}`}
                            className="block font-medium underline-offset-4 hover:underline"
                        >
                            {page.name}
                        </Link>

                        <div className="flex gap-2 mt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500"
                                onClick={() => toggleArchive(page, true)}
                            >
                                Архивировать
                            </Button>
                            {/* Кнопка удаления для активных страниц */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500"
                                onClick={() => handleDelete(page)}
                                disabled={deletingPageId === page.id}
                            >
                                {deletingPageId === page.id
                                    ? 'Удаление...'
                                    : 'Удалить'}
                            </Button>
                        </div>

                        <AnimatePresence initial={false}>
                            {getShownSessions(page.id, page.sessions ?? []).map(
                                (s) => (
                                    <motion.div
                                        key={s.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <SessionLine session={s} />
                                    </motion.div>
                                )
                            )}
                        </AnimatePresence>

                        {(page.sessions?.length ?? 0) >
                            (sessionsShown[page.id] ?? 2) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShowMore(page.id)}
                                className="text-blue-600"
                            >
                                Показать ещё
                            </Button>
                        )}

                        <AnimatePresence>
                            {(sessionsShown[page.id] ?? 2) > 2 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setSessionsShown((prev) => ({
                                                ...prev,
                                                [page.id]: 2,
                                            }))
                                        }
                                        className="text-gray-500"
                                    >
                                        Скрыть истории
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </li>
                ))}
            </ul>

            {/* архивные страницы */}
            {showArchived && archivedPages.length > 0 && (
                <>
                    <h2 className="mt-6 text-sm font-semibold text-muted-foreground">
                        Архивные
                    </h2>
                    <ul className="space-y-2">
                        {archivedPages.map((page) => (
                            <li
                                key={page.id}
                                className="border p-3 rounded
                           opacity-60 bg-muted/40 dark:bg-muted/20 hover:bg-muted/40"
                            >
                                <span className="block font-medium line-through">
                                    {page.name}
                                </span>

                                <div className="flex gap-2 mt-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-green-600"
                                        onClick={() =>
                                            toggleArchive(page, false)
                                        }
                                    >
                                        Разархивировать
                                    </Button>
                                    {/* Кнопка удаления для архивных страниц */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500"
                                        onClick={() => handleDelete(page)}
                                        disabled={deletingPageId === page.id}
                                    >
                                        {deletingPageId === page.id
                                            ? 'Удаление...'
                                            : 'Удалить'}
                                    </Button>
                                </div>

                                {page.sessions?.map((s) => (
                                    <SessionLine key={s.id} session={s} />
                                ))}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
