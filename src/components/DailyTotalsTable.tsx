'use client';

import { DailySalesRow } from '@/types';

export default function DailyTotalsTable({ rows }: { rows: DailySalesRow[] }) {
    if (!rows.length) return <p className="text-gray-500">Нет данных.</p>;

    return (
        <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                    <th className="border p-2">Товар</th>
                    <th className="border p-2 text-center">Загрузка</th>
                    <th className="border p-2 text-center">Возврат</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((r) => (
                    <tr
                        key={r.id}
                        className="even:bg-gray-50 dark:even:bg-gray-900"
                    >
                        <td className="border p-2">{r.name}</td>
                        <td className="border p-2 text-center">{r.load}</td>
                        <td className="border p-2 text-center text-red-600">
                            {r.return_qty}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
