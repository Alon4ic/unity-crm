'use client';

import { ParsedItem } from '@/types';

interface Props {
    items: ParsedItem[];
    onChange: (updated: ParsedItem[]) => void;
}

export function InvoiceEditTable({ items, onChange }: Props) {
    const updateItem = (index: number, updates: Partial<ParsedItem>) => {
        const updated = [...items];
        updated[index] = {
            ...updated[index],
            ...updates,
            draft: false, // снимаем флаг черновика
        };
        onChange(updated);
    };

    const deleteItem = (index: number) => {
        const updated = items.filter((_, i) => i !== index);
        onChange(updated);
    };

    return (
        <table className="table-fixed border w-full text-sm">
            <thead>
                <tr className="bg-gray-100 text-left">
                    <th className="border p-1">Название</th>
                    <th className="border p-1">Код</th>
                    <th className="border p-1">Количество</th>
                    <th className="border p-1">Ед.</th>
                    <th className="border p-1">Цена</th>
                    <th className="border p-1 w-8"></th>
                </tr>
            </thead>
            <tbody>
                {items.map((item, i) => (
                    <tr
                        key={i}
                        className={`border-b ${
                            item.draft ? 'bg-yellow-100 text-gray-800' : ''
                        }`}
                    >
                        <td className="border p-1 flex items-center gap-1">
                            <input
                                className="w-full border rounded px-1 py-0.5"
                                value={item.name}
                                onChange={(e) =>
                                    updateItem(i, { name: e.target.value })
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.currentTarget.blur();
                                    }
                                }}
                            />
                            {item.draft && (
                                <span title="Проверьте данные товара">⚠️</span>
                            )}
                        </td>
                        <td className="border p-1">
                            <input
                                className="w-full border rounded px-1 py-0.5"
                                value={item.code ?? ''}
                                onChange={(e) =>
                                    updateItem(i, { code: e.target.value })
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.currentTarget.blur();
                                    }
                                }}
                            />
                        </td>
                        <td className="border p-1">
                            <input
                                type="number"
                                className="w-full border rounded px-1 py-0.5"
                                value={item.quantity?.toString() ?? ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    updateItem(i, {
                                        quantity:
                                            value === ''
                                                ? undefined
                                                : parseFloat(value),
                                    });
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.currentTarget.blur();
                                    }
                                }}
                            />
                        </td>
                        <td className="border p-1">
                            <input
                                className="w-full border rounded px-1 py-0.5"
                                value={item.unit ?? ''}
                                onChange={(e) =>
                                    updateItem(i, { unit: e.target.value })
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.currentTarget.blur();
                                    }
                                }}
                            />
                        </td>
                        <td className="border p-1">
                            <input
                                type="number"
                                className="w-full border rounded px-1 py-0.5"
                                value={item.price?.toString() ?? ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    updateItem(i, {
                                        price:
                                            value === ''
                                                ? undefined
                                                : parseFloat(value),
                                    });
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.currentTarget.blur();
                                    }
                                }}
                            />
                        </td>
                        <td className="border p-1 text-center">
                            <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => deleteItem(i)}
                                title="Удалить строку"
                            >
                                ✖
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
