'use client';

import { useState } from 'react';
import SessionSalesTable, { SessionRow } from '@/components/SessionSalesTable';
import { supabase } from '@/lib/supabase/client';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

interface SessionLineProps {
    session: {
        id: string;
        started_at: string;
        ended_at: string | null;
        total_sales_sum: number | null;
    };
}

export default function SessionLine({ session }: SessionLineProps) {
    const [rows, setRows] = useState<SessionRow[]>([]);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(2);

    const fetchRows = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('vw_session_sales')
            .select(
                'product_id,name,code,price_with_markup,total_load,total_return'
            )
            .eq('session_id', session.id);

        setLoading(false);
        if (error) return;

        const processed = (data ?? []).map((d) => {
            const sold = (d.total_load ?? 0) - (d.total_return ?? 0);
            const sum = sold * (d.price_with_markup ?? 0);

            return {
                id: d.product_id,
                name: d.name,
                code: d.code,
                price_with_markup: d.price_with_markup,
                sold,
                sum,
            } satisfies SessionRow;
        });

        setRows(processed);
        setShow(true);
        setVisibleCount(2); // сброс при новом fetch
    };

    const start = dayjs(session.started_at).format('D MMMM YYYY');
    const end = session.ended_at
        ? dayjs(session.ended_at).format('D MMMM YYYY')
        : 'Текущая';

    const visibleRows = rows.slice(0, visibleCount);
    const hasMore = rows.length > visibleCount;

    return (
        <div className="border rounded p-3 space-y-2">
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-sm text-gray-500">
                        <span className="font-medium">Период:</span> {start} —{' '}
                        {end}
                    </div>
                    <div className="text-sm text-gray-500">
                        <span className="font-medium">Сумма продаж:</span>{' '}
                        {session.total_sales_sum !== null
                            ? session.total_sales_sum.toFixed(2)
                            : '—'}{' '}
                        ₴
                    </div>
                </div>
            </div>
        </div>
    );
}
