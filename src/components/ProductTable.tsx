'use client';

interface ProductTableProps {
    products: any[];
}

export default function ProductTable({ products }: ProductTableProps) {
    const total = products.reduce(
        (sum, p) => sum + (p.price || 0) * (p.quantity || 0),
        0
    );

    return (
        <table className="w-full border text-sm mb-8">
            <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                    <th className="border p-2">#</th>
                    <th className="border p-2">Код</th>
                    <th className="border p-2">Название</th>
                    <th className="border p-2">Единица</th>
                    <th className="border p-2">Количество</th>
                    <th className="border p-2">Цена</th>
                    <th className="border p-2">Стоимость</th>
                </tr>
            </thead>
            <tbody>
                {products.map((product, idx) => (
                    <tr key={product.id}>
                        <td className="border p-2 text-center">{idx + 1}</td>
                        <td className="border p-2">{product.code || '-'}</td>
                        <td className="border p-2">{product.name}</td>
                        <td className="border p-2">{product.unit}</td>
                        <td className="border p-2">{product.quantity}</td>
                        <td className="border p-2">{product.price}</td>
                        <td className="border p-2 font-semibold">
                            {(product.quantity * product.price).toFixed(2)}
                        </td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr className="bg-gray-50 dark:bg-gray-900 font-medium">
                    <td colSpan={6} className="border p-2 text-right">
                        Общая стоимость товаров на складе
                    </td>
                    <td className="border p-2 font-bold">{total.toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
    );
}
