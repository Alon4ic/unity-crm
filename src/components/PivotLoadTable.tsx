'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';

/* ---------- строка из Supabase/Dexie ---------- */
export interface FlatRow {
  product_name: string;
  price_with_markup: number;   // число
  date: string;                // YYYY-MM-DD
  total_load: number;
  total_return: number;
}

type Props = {
  data: FlatRow[];
};

/* форматирование чисел */
const fmt = (n: number) => n.toLocaleString('ru-RU');

/* helpers для сортировки строк товаров */
const compareStrings = (a: string, b: string, asc = true) =>
  asc ? a.localeCompare(b) : b.localeCompare(a);

export default function PivotLoadTable({ data }: Props) {
  /* --- состояние сортировки --- */
  const [dateAsc, setDateAsc]     = useState(false); // сначала новые вправо
  const [nameAsc, setNameAsc]     = useState(true);

  /* --- уникальные даты + группировка по товару --- */
  const { dates, rows } = useMemo(() => {
    const dateSet = new Set<string>();
    const map: Record<string, any> = {};

    data.forEach(r => {
      dateSet.add(r.date);
      if (!map[r.product_name]) {
        map[r.product_name] = {
          name:  r.product_name,
          price: r.price_with_markup,
          daily: {},
        };
      }
      map[r.product_name].daily[r.date] = {
        load:   r.total_load,
        return: r.total_return,
      };
    });

    /* сортировка дат */
    const datesArr = Array.from(dateSet).sort((a, b) =>
      dateAsc ? a.localeCompare(b) : b.localeCompare(a),
    );

    /* сортировка товаров */
    const rowsArr = Object.values(map).sort((a: any, b: any) =>
      compareStrings(a.name, b.name, nameAsc),
    );

    return { dates: datesArr, rows: rowsArr };
  }, [data, dateAsc, nameAsc]);

  /* --- рендер --- */
  return (
    <div className="overflow-x-auto rounded border dark:border-gray-600">
      <table className="min-w-max text-sm border-collapse">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            {/* Заголовок товара + кнопка сортировки */}
            <th className="sticky left-0 z-20 p-2 border-r bg-gray-100 dark:bg-gray-800">
              <button
                onClick={() => setNameAsc(!nameAsc)}
                className="flex items-center gap-1 font-medium"
              >
                Товар&nbsp;
                <span className="text-xs">
                  {nameAsc ? '▲' : '▼'}
                </span>
              </button>
            </th>

            {/* Заголовки дат + кнопка сортировки */}
            {dates.map(d => (
              <th key={d} className="p-2 border-r whitespace-nowrap">
                {d}
              </th>
            ))}

            {/* кнопка сортировки дат в конце */}
            <th className="p-2">
              <button
                onClick={() => setDateAsc(!dateAsc)}
                className="text-xs"
                title="Сортировать даты"
              >
                {dateAsc ? '▲' : '▼'}
              </button>
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map(row => (
            <tr key={row.name} className="even:bg-gray-50 dark:even:bg-gray-900">
              {/* ——— липкая ячейка товара ——— */}
              <td
                className={clsx(
                  'sticky left-0 z-10 border-r p-2 bg-white dark:bg-gray-900',
                  'whitespace-nowrap backdrop-blur',
                )}
              >
                <div>{row.name}</div>
                <div className="text-xs text-gray-500">
                  {fmt(row.price)}&nbsp;₽
                </div>
              </td>

              {/* ——— данные по датам ——— */}
              {dates.map(d => {
                const day = row.daily[d];
                if (!day) {
                  return (
                    <td key={d} className="p-2 text-center text-gray-400">
                      —
                    </td>
                  );
                }

                const { load, return: ret } = day;
                const hasLoad = load > 0;
                const hasRet  = ret  > 0;

                return (
                  <td key={d} className="p-2 text-xs leading-5">
                    {hasLoad && (
                      <div>
                        {fmt(load)} × {fmt(row.price)} ₽ = {fmt(load * row.price)} ₽
                      </div>
                    )}
                    {hasRet && (
                      <div className="text-red-600">
                        {fmt(ret)} × {fmt(row.price)} ₽ = -{fmt(ret * row.price)} ₽
                      </div>
                    )}
                  </td>
                );
              })}

              {/* пустая ячейка-плейсхолдер под кнопку сортировки дат */}
              <td className="p-2" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
