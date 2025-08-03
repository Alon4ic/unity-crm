import { SalesReportRow } from '@/lib/reports/getSalesReport';

interface Props {
    data: SalesReportRow[];
}

export function SalesReportTable({ data }: Props) {
    const total = data.reduce(
        (acc, row) => {
            acc.sold += row.sold;
            acc.cost += row.cost;
            acc.costWithMarkup += row.costWithMarkup;
            acc.profit += row.profit;
            return acc;
        },
        { sold: 0, cost: 0, costWithMarkup: 0, profit: 0 }
    );

    return (
        <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                        <th className="px-4 py-2 text-left">Название</th>
                        <th className="px-4 py-2">Код</th>
                        <th className="px-4 py-2">Ед.</th>
                        <th className="px-4 py-2">Продано</th>
                        <th className="px-4 py-2">Себестоимость</th>
                        <th className="px-4 py-2">С наценкой</th>
                        <th className="px-4 py-2">Прибыль</th>
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
                            <td className="px-4 py-2 text-right">{row.sold.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right">
                                {row.cost.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-right">
                                {row.costWithMarkup.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-right">
                                {row.profit.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                    <tr className="bg-gray-50 dark:bg-gray-900 font-semibold border-t">
                        <td className="px-4 py-2" colSpan={3}>
                            Итого
                        </td>
                        <td className="px-4 py-2 text-right">{total.sold}</td>
                        <td className="px-4 py-2 text-right">
                            {total.cost.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                            {total.costWithMarkup.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                            {total.profit.toFixed(2)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
