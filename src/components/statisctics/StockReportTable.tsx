import { StockReportRow } from '@/lib/reports/getStockReport';

interface Props {
    data: StockReportRow[];
}

export function StockReportTable({ data }: Props) {
    const total = data.reduce(
        (acc, row) => {
            acc.initial += row.initial;
            acc.delivered += row.delivered;
            acc.returned += row.returned;
            acc.sold += row.sold;
            acc.current += row.current;
            return acc;
        },
        { initial: 0, delivered: 0, returned: 0, sold: 0, current: 0 }
    );

    return (
        <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                        <th className="px-4 py-2 text-left">Название</th>
                        <th className="px-4 py-2">Код</th>
                        <th className="px-4 py-2">Ед.</th>
                        <th className="px-4 py-2">На начало</th>
                        <th className="px-4 py-2">Поставки</th>
                        <th className="px-4 py-2">Возвраты</th>
                        <th className="px-4 py-2">Продано</th>
                        <th className="px-4 py-2">Текущий остаток</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr
                            key={`${row.code || 'nocode'}-${index}`}
                            className="border-t hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <td className="px-4 py-2 whitespace-nowrap">
                                {row.name}
                            </td>
                            <td className="px-4 py-2 text-center">
                                {row.code}
                            </td>
                            <td className="px-4 py-2 text-center">
                                {row.unit}
                            </td>
                            <td className="px-4 py-2 text-right">
                                {row.initial.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-right">
                                {row.delivered.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-right">
                                {row.returned.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-right">{row.sold.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right">
                                {row.current.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                    <tr className="bg-gray-50 dark:bg-gray-900 font-semibold border-t">
                        <td className="px-4 py-2" colSpan={3}>
                            Итого
                        </td>
                        <td className="px-4 py-2 text-right">
                            {total.initial.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                            {total.delivered.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                            {total.returned.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">{total.sold.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">
                            {total.current.toFixed(2)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
