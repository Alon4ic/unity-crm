import ImportProducts from '@/components/ImportProducts';


export default function ProductsPage() {
    return (
        <main className="p-6 space-y-8">
            <h1 className="text-2xl font-bold mb-6">Импорт из XLSX</h1>
            <p className="text-base font-bold mb-6">Перенесите список товаров вашего склада в таблицу учета</p>

            {/* Импорт товаров */}
            <ImportProducts />
        </main>
    );
}
