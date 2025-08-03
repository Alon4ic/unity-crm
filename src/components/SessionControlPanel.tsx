'use client';

import { useState } from 'react';
import { useManagerSessions } from '@/hooks/useManagerSessions';
import { useReturnTransfer } from '@/hooks/useReturnTransfer';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
    salePageId: string;
    onFinishCallback?: () => Promise<void>;
    startSession?: () => Promise<void>;
    extraButton?: React.ReactNode;
    fetchProducts: () => Promise<void>;
    fetchSales: () => Promise<void>;
    fetchEvents: () => Promise<void>;
}

export function SessionControlPanel({
    salePageId,
    onFinishCallback,
    extraButton,
    fetchProducts,
    fetchSales,
    fetchEvents,
}: Props) {
    const { sessions, activeSession, startSession, finishSession, loading } =
        useManagerSessions(salePageId);
    const { transferReturnsToNewSession } = useReturnTransfer();

    const [duration, setDuration] = useState<number>(7);
    const [useReturnBuffer, setUseReturnBuffer] = useState(false);
    const [visibleCount, setVisibleCount] = useState(2);

    if (loading) return <p>Загрузка сессий…</p>;

    const sortedSessions = [...sessions].sort(
        (a, b) =>
            new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

    const confirmStart = async () => {
        if (!confirm(`Начать новую сессию на ${duration} дней?`)) return;

        try {
            const newSession = await startSession(duration);
            if (!newSession) {
                toast.error('Не удалось создать сессию');
                return;
            }

            if (useReturnBuffer) {
                try {
                    await transferReturnsToNewSession(salePageId);
                    await Promise.all([
                        fetchProducts(),
                        fetchSales(),
                        fetchEvents(),
                    ]);
                    toast.success('Возвраты перенесены как новая загрузка');
                } catch (transferError) {
                    console.error(
                        'Ошибка при переносе возвратов:',
                        transferError
                    );
                    toast.error('Ошибка переноса возвратов');
                }
            } else {
                toast.success('Сессия успешно запущена');
            }
        } catch (e) {
            console.error('Ошибка при запуске сессии:', e);
            toast.error('Не удалось запустить сессию');
        }
    };

    const confirmFinish = async () => {
        if (confirm('Завершить текущую сессию?')) {
            await finishSession();
            if (onFinishCallback) await onFinishCallback();
        }
    };

    const handleShowMore = () => {
        setVisibleCount((prev) => prev + 5);
    };

    const handleShowLess = () => {
        setVisibleCount(2);
    };

    return (
        <div className="space-y-4 border rounded p-4">
            {activeSession ? (
                <>
                    <p className="font-semibold">
                        Активная с{' '}
                        {new Date(activeSession.started_at).toLocaleString()}
                        {activeSession.duration_days && (
                            <> (+{activeSession.duration_days} дн.)</>
                        )}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            className="btn btn-danger"
                            onClick={confirmFinish}
                        >
                            Завершить сессию
                        </button>
                        {extraButton}
                    </div>
                </>
            ) : (
                <>
                    <div className="flex items-center gap-2">
                        <label>Длительность:</label>
                        <select
                            value={duration}
                            onChange={(e) =>
                                setDuration(Number(e.target.value))
                            }
                            className="border rounded p-1"
                        >
                            {[3, 7, 14, 30].map((d) => (
                                <option key={d} value={d}>
                                    {d} дн.
                                </option>
                            ))}
                        </select>
                    </div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={useReturnBuffer}
                            onChange={(e) =>
                                setUseReturnBuffer(e.target.checked)
                            }
                        />
                        Переносить возвраты из предыдущей сессии
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            className="btn btn-primary"
                            onClick={confirmStart}
                        >
                            Начать новую сессию
                        </button>
                        {extraButton}
                    </div>
                </>
            )}

            <hr className="my-4" />
            <h3 className="font-bold">История сессий</h3>

            <ul className="space-y-1 text-sm max-h-[300px] overflow-y-auto">
                <AnimatePresence initial={false}>
                    {sortedSessions.slice(0, visibleCount).map((s) => (
                        <motion.li
                            key={s.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gray-50 px-2 py-1 rounded"
                        >
                            <span className="font-medium">
                                {new Date(s.started_at).toLocaleDateString()}
                            </span>{' '}
                            →{' '}
                            <span>
                                {s.ended_at
                                    ? new Date(s.ended_at).toLocaleDateString()
                                    : 'Активна'}
                            </span>
                            {s.duration_days && <> — {s.duration_days} дн.</>}
                            {s.total_sales_sum && (
                             <>
                                 {' '}
                                 — Сумма продаж: {s.total_sales_sum.toFixed(2)}₽
                             </>
                         )}
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>

            <div className="flex gap-2 mt-2">
                {visibleCount < sortedSessions.length && (
                    <button
                        className="btn btn-outline"
                        onClick={handleShowMore}
                    >
                        Показать ещё
                    </button>
                )}
                {visibleCount > 2 && (
                    <button
                        className="btn btn-outline"
                        onClick={handleShowLess}
                    >
                        Скрыть истории
                    </button>
                )}
            </div>
        </div>
    );
}

