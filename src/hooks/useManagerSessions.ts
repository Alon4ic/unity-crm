import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
    db,
    type ManagerSession,
    type LoadTransaction,
} from '@/lib/dexie/productsDB';
import toast from 'react-hot-toast';
import {
    saveReturnBuffer
} from '@/lib/sync/returnBufferSync';

export interface SessionWithTotals extends ManagerSession {
    loaded: number;
    returned: number;
    salesSum: number;
}

export function useManagerSessions(salePageId: string) {
    const [sessions, setSessions] = useState<SessionWithTotals[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [sessionAggregates, setSessionAggregates] = useState({
        loaded: 0,
        returned: 0,
        salesSum: 0,
    });

    function normalizeSession(session: {
        id: string;
        sale_page_id: string;
        started_at: string;
        ended_at: string | null;
        duration_days: number | null;
        total_sales_sum: number | null;
        total_loaded: number | null;
        total_return: number | null;
    }): ManagerSession {
        return {
            id: session.id,
            sale_page_id: session.sale_page_id,
            started_at: session.started_at,
            ended_at: session.ended_at ?? undefined,
            duration_days: session.duration_days ?? undefined,
            total_sales_sum: session.total_sales_sum ?? undefined,
            total_loaded: session.total_loaded ?? undefined,
            total_return: session.total_return ?? undefined,
        };
    }


    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            // Загружаем сессии из Supabase
            const { data, error } = await supabase
                .from('manager_sessions')
                .select(
                    'id, sale_page_id, started_at, ended_at, duration_days, total_sales_sum'
                )
                .eq('sale_page_id', salePageId)
                .order('started_at', { ascending: false });

            if (error) {
                toast.error('Не удалось загрузить сессии');
                setLoading(false);
                return;
            }

            // Сохраняем в локальную базу
            await db.manager_sessions.clear();
            if (data && data.length > 0) {
                await db.manager_sessions.bulkPut(data as ManagerSession[]);
            }

            // Загружаем все транзакции для расчета агрегатов
            const allTx: LoadTransaction[] = await db.load_transactions
                .where('sale_page_id')
                .equals(salePageId)
                .toArray();

            // Пересчитываем агрегаты для каждой сессии
            const sessionsWithTotals = (data || []).map((session) => {
                const start = new Date(session.started_at).getTime();
                const end = session.ended_at
                    ? new Date(session.ended_at).getTime()
                    : Date.now();

                const txInRange = allTx.filter((tx) => {
                    const txTime = new Date(tx.created_at).getTime();
                    return txTime >= start && txTime < end;
                });

                let loaded = 0;
                let returned = 0;
                let salesSum = 0;

                txInRange.forEach((tx) => {
                    loaded += tx.load;
                    returned += tx.return_qty;
                    const soldCount = tx.load - tx.return_qty;
                    salesSum += soldCount * tx.price_with_markup;
                });

                const finalSalesSum = session.ended_at
                    ? (session.total_sales_sum ?? salesSum)
                    : salesSum;

                return {
                    ...session,
                    total_sales_sum: session.total_sales_sum ?? undefined, // 👈 ключевая строка
                    loaded,
                    returned,
                    salesSum: finalSalesSum,
                };
            });


            setSessions(sessionsWithTotals);
            setLoading(false);
        } catch (e) {
            console.error('Ошибка fetchSessions:', e);
            toast.error('Ошибка при загрузке сессий');
            setLoading(false);
        }
    }, [salePageId]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const activeSession = sessions.find((s) => !s.ended_at);

    const startSession = async (
        durationDays: number
    ): Promise<ManagerSession | null> => {
        try {
            // 1. Проверяем наличие активной сессии через запрос к БД
            const activeInDB = await db.manager_sessions
                .where('sale_page_id')
                .equals(salePageId)
                .and((s) => !s.ended_at)
                .first();

            // 2. Завершаем только если найдена активная сессия
            if (activeInDB) {
                await finishSession(activeInDB);
            }

            // 3. Создаем новую сессию в Supabase
            const { data: newSession, error } = await supabase
                .from('manager_sessions')
                .insert({
                    sale_page_id: salePageId,
                    started_at: new Date().toISOString(),
                    duration_days: durationDays,
                    total_sales_sum: 0,
                    total_loaded: 0,
                    total_return: 0,
                })
                .select('*')
                .single();

            if (!newSession) throw new Error('Ошибка: Supabase вернул null');

            // Приведение типов, если нужно:
            const castedSession = normalizeSession(newSession);

            await db.manager_sessions.add(castedSession);

            // 5. Сброс агрегатов
            setSessionAggregates({
                loaded: 0,
                returned: 0,
                salesSum: 0,
            });

            toast.success('✅ Сессия начата');
            await fetchSessions();

            // 6. Возвращаем созданную сессию для дальнейшего использования
            return {
                ...newSession,
                duration_days: newSession.duration_days ?? undefined,
                ended_at: newSession.ended_at ?? undefined,
                total_sales_sum: newSession.total_sales_sum ?? undefined,
                total_loaded: newSession.total_loaded ?? undefined,
                total_return: newSession.total_return ?? undefined,
            };
        } catch (err: any) {
            console.error('🚨 Ошибка startSession:', err?.message ?? err);
            toast.error('Не удалось начать сессию');
            return null;
        }
    };

    
    const finishSession = async (sessionToFinish?: ManagerSession) => {
        const session = sessionToFinish || activeSession;
        if (!session) {
            toast('Нет активной сессии');
            return;
        }

        try {
            const endedAt = new Date().toISOString();
            const allTx: LoadTransaction[] = await db.load_transactions
                .where('sale_page_id')
                .equals(salePageId)
                .toArray();

            const sessionStart = new Date(session.started_at).getTime();
            const sessionEnd = Date.now();

            const txInRange = allTx.filter((tx) => {
                const txTime = new Date(tx.created_at).getTime();
                return txTime >= sessionStart && txTime < sessionEnd;
            });

            let totalSales = 0;
            txInRange.forEach((tx) => {
                const soldCount = tx.load - tx.return_qty;
                totalSales += soldCount * tx.price_with_markup;
            });

            // Обновляем сессию в Supabase
            const { error } = await supabase
                .from('manager_sessions')
                .update({
                    ended_at: endedAt,
                    total_sales_sum: totalSales,
                })
                .eq('id', session.id);

            if (error) throw error;

            // Обновляем локальную базу
            await db.manager_sessions.update(session.id, {
                ended_at: endedAt,
                total_sales_sum: totalSales,
            });

            // Сохраняем возвраты в буфер
            const latestReturnsMap = new Map<string, number>();
            txInRange.forEach((tx) => {
                const existing = latestReturnsMap.get(tx.product_id) || 0;
                latestReturnsMap.set(tx.product_id, existing + tx.return_qty);
            });

            await saveReturnBuffer(salePageId, latestReturnsMap);

            toast.success('Сессия завершена');
            await fetchSessions();
        } catch (e) {
            console.error('Ошибка finishSession:', e);
            toast.error('Не удалось завершить сессию');
        }
    };
    const updateSessionAggregates = (
        load: number,
        return_qty: number,
        salesSum: number
    ) => {
        setSessionAggregates((prev) => ({
            loaded: prev.loaded + load,
            returned: prev.returned + return_qty,
            salesSum: prev.salesSum + salesSum,
        }));
    };

    return {
        sessions,
        activeSession,
        loading,
        sessionAggregates,
        startSession,
        finishSession,
        updateSessionAggregates,
    };
}
