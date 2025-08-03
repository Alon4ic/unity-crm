interface ProductTableFooterProps {
    total: number;
    totalWithoutMarkup: number;
    profit: number;
}

export default function ProductTableFooter({
    total,
    totalWithoutMarkup,
    profit,
}: ProductTableFooterProps) {
    return (
        <tfoot>
            <tr className="bg-gray-50 dark:bg-gray-900 font-medium">
                <td colSpan={8} className="border p-2 text-right">
                    Общая стоимость (без наценки)
                </td>
                <td className="border p-2 font-bold">
                    {totalWithoutMarkup.toFixed(2)}
                </td>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-900 font-medium">
                <td colSpan={8} className="border p-2 text-right">
                    Общая стоимость с наценкой
                </td>
                <td className="border p-2 font-bold">{total.toFixed(2)}</td>
            </tr>
            <tr className="bg-gray-100 dark:bg-gray-800 font-medium">
                <td colSpan={8} className="border p-2 text-right">
                    Доход
                </td>
                <td className="border p-2 font-bold text-green-600">
                    {profit.toFixed(2)}
                </td>
            </tr>
        </tfoot>
    );
}
