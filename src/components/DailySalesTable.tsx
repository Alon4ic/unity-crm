'use client';


import { DailySalesRow } from '@/types';
import React from 'react';
// убедитесь, что путь корректен

type Props = {
    rows: DailySalesRow[];
    onHide: () => void;
};

const DailySalesTable: React.FC<Props> = ({ rows, onHide }) => {
    if (rows.length === 0) return null;

    const totalSalesSum = rows.reduce((sum, r) => sum + r.salesSum, 0);

    return (
        <>
            <button
                onClick={onHide}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded mb-2"
            >
                Скрыть таблицу
            </button>

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2 text-left">Название</th>
                            <th className="border p-2 text-left">Код</th>
                            <th className="border p-2 text-right">Цена</th>
                            <th className="border p-2 text-right">
                                Цена&nbsp;с&nbsp;наценкой
                            </th>
                            <th className="border p-2 text-right">Загрузка</th>
                            <th className="border p-2 text-right">Возврат</th>
                            <th className="border p-2 text-right">Стоимость</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.id}>
                                <td className="border p-2">{r.name}</td>
                                <td className="border p-2">{r.code}</td>
                                <td className="border p-2 text-right">
                                    {r.price?.toFixed(2)}
                                </td>
                                <td className="border p-2 text-right">
                                    {r.price_with_markup.toFixed(2)}
                                </td>
                                <td className="border p-2 text-right">
                                    {r.load}
                                </td>
                                <td className="border p-2 text-right">
                                    {r.return_qty}
                                </td>
                                <td className="border p-2 text-right">
                                    {r.salesSum.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                        <tr className="bg-gray-100 font-semibold">
                            <td colSpan={6} className="border p-2 text-right">
                                Итого:
                            </td>
                            <td className="border p-2 text-right">
                                {totalSalesSum.toFixed(2)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default DailySalesTable;
