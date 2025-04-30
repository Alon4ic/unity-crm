import { Product } from "@/app/hooks/useProducts";


export const ProductTable = ({ products }: { products: Product[] }) => {
    if (products.length === 0)
        return <div className="text-center p-6 text-gray-500">Нет товаров</div>;

    return (
        <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left">#</th>
                        <th className="p-3 text-left">Код</th>
                        <th className="p-3 text-left">Название</th>
                        <th className="p-3 text-left">Ед. изм.</th>
                        <th className="p-3 text-right">Цена</th>
                        <th className="p-3 text-right">Кол-во</th>
                        <th className="p-3 text-right">Сумма</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p, i) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                            <td className="p-3 border-t">{i + 1}</td>
                            <td className="p-3 border-t">{p.code ?? '-'}</td>
                            <td className="p-3 border-t font-medium">
                                {p.name}
                            </td>
                            <td className="p-3 border-t">{p.unit}</td>
                            <td className="p-3 border-t text-right">
                                {p.price.toFixed(2)}
                            </td>
                            <td className="p-3 border-t text-right">
                                {p.quantity}
                            </td>
                            <td className="p-3 border-t text-right font-medium">
                                {(p.price * p.quantity).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
