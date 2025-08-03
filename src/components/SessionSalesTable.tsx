'use client';

import React from 'react';

export interface SessionRow {
  id: string;           // product_id
  name: string;
  code?: string | null;
  price_with_markup: number;
  sold: number;         // total_load - total_return
  sum: number;          // sold * price_with_markup
}

type Props = {
  rows: SessionRow[];
  onHide: () => void;
};

export default function SessionSalesTable({ rows, onHide }: Props) {
  if (rows.length === 0) return null;

  const total = rows.reduce((s, r) => s + r.sum, 0);

  return (
    <>
      <button
        onClick={onHide}
        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded mb-2"
      >
        Скрыть таблицу
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Название</th>
              <th className="border p-2 text-left">Код</th>
              <th className="border p-2 text-right">Стоимость&nbsp;с&nbsp;наценкой</th>
              <th className="border p-2 text-right">Продано</th>
              <th className="border p-2 text-right">Сумма</th>
            </tr>
          </thead>

          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td className="border p-2">{r.name}</td>
                <td className="border p-2">{r.code ?? '—'}</td>
                <td className="border p-2 text-right">
                  {r.price_with_markup.toFixed(2)}
                </td>
                <td className="border p-2 text-right">{r.sold}</td>
                <td className="border p-2 text-right">{r.sum.toFixed(2)}</td>
              </tr>
            ))}

            <tr className="bg-gray-100 font-semibold">
              <td colSpan={4} className="border p-2 text-right">Итого:</td>
              <td className="border p-2 text-right">{total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
