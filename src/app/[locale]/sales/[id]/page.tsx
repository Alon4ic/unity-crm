'use client';

import {
    useEffect,
    useState,
    useMemo,
} from 'react';
import { useParams } from 'next/navigation';
import {
    db,
    type Sale,
    type LoadTransaction,
    type Product,
} from '@/lib/dexie/productsDB';

import ProductTable from '@/components/ProductTable';
import { SessionControlPanel } from '@/components/SessionControlPanel';
import DateFilter from '@/components/DateFilter';
import DailySalesTable from '@/components/DailySalesTable';
import { DailySalesRow, ExtendedProduct } from '@/types';
import SearchBar from '@/components/SearchBar';
import useProductSearch from '@/hooks/useProductSearch';
import { useResetSalesAggregates } from '@/hooks/useResetSalesAggregates';
import { useSalesUpdater } from '@/hooks/sales/useSalesUpdater';
import { useSalesProducts } from '@/hooks/sales/useSalesProducts';
import { useSalesFetcher } from '@/hooks/sales/useSalesFetcher';
import { useLoadEventsFetcher } from '@/hooks/sales/useLoadEventsFetcher';
import { useSalesPageInit } from '@/hooks/sales/useSalesPageInit';
import { useRowsForSalesTable } from '@/hooks/sales/useRowsForSalesTable';

export default function SalesIdPage() {
    const params = useParams();
    const id = params?.id as string | undefined;
    const salePageId = id as string;
    console.log(salePageId);
    const [managerName, setManagerName] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [showTable, setShowTable] = useState(false);
    const [events, setEvents] = useState<LoadTransaction[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [dailyRows, setDailyRows] = useState<DailySalesRow[]>([]);

    // Группировка по выбранной дате
    useEffect(() => {
        if (!selectedDate) {
            setDailyRows([]);
            setShowTable(false);
            return;
        }

        const sel = new Date(selectedDate);
        const map = new Map<string, DailySalesRow>();

        sales.forEach((sale) => {
            const dt = new Date(sale.created_at);
            if (
                dt.getFullYear() === sel.getFullYear() &&
                dt.getMonth() === sel.getMonth() &&
                dt.getDate() === sel.getDate()
            ) {
                const prod = products.find((p) => p.id === sale.product_id);
                if (!prod) return;

                if (!map.has(sale.product_id)) {
                    const price = prod.price;
                    const markup = prod.markup_percent ?? 0;
                    const pw = price * (1 + markup / 100);
                    map.set(sale.product_id, {
                        id: prod.id,
                        name: prod.name,
                        code: prod.code || '',
                        price,
                        price_with_markup: pw,
                        load: 0,
                        return_qty: 0,
                        markup_percent: markup,
                        stock: 0,
                        salesSum: 0,
                    });
                }

                const row = map.get(sale.product_id)!;
                row.load += sale.load;
                row.return_qty += sale.return_qty;
                row.salesSum +=
                    row.price_with_markup * (sale.load - sale.return_qty);
            }
        });

        setDailyRows(Array.from(map.values()));
        setShowTable(true);
    }, [selectedDate, sales, products]);

    /* ---------- Вычисление total_loaded и total_return ---------- */
    const totalsByProduct = useMemo(() => {
        const map = new Map<
            string,
            { total_loaded: number; total_return: number }
        >();
        const filtered = events.filter((e) => e.sale_page_id === id);

        filtered.forEach((e) => {
            const obj = map.get(e.product_id) ?? {
                total_loaded: 0,
                total_return: 0,
            };
            obj.total_loaded += e.load ?? 0;
            obj.total_return += e.return_qty ?? 0;
            map.set(e.product_id, obj);
        });

        return map;
    }, [events, id]);

    /* ---------- Загрузка товаров ---------- */
    const { fetchProducts } = useSalesProducts(salePageId, setProducts);

    /* ---------- Загрузка sales ---------- */
    const { fetchSales } = useSalesFetcher(id, setSales);

    const { fetchEvents } = useLoadEventsFetcher(id, setEvents);
    /* ---------- INIT ---------- */
    useSalesPageInit({
        salePageId: id,
        fetchProducts,
        fetchSales,
        fetchEvents,
        setManagerName,
    });

    /* ---------- helpers ---------- */
    const saleMap = useMemo(
        () => new Map(sales.map((s) => [s.product_id, s])),
        [sales]
    );

    /* ---------- UPDATE (добавление транзакций) ---------- */
    const { handleUpdate } = useSalesUpdater({
        salePageId: id,
        totalsByProduct,
        setSales,
        setEvents,
        setProducts,
    });

    const extended = products.map((p) => ({
        ...p,
        markup_percent: p.markup_percent ?? 0, // гарантируем число
    })) as ExtendedProduct[];

    const rowsForTable = useRowsForSalesTable(extended, totalsByProduct);

    /* ---------- Очистка транзакций для текущей страницы ---------- */
    const { resetSalesAggregates } = useResetSalesAggregates(
        id,
        setEvents,
        fetchProducts
    );
    const {
        searchQuery,
        setSearchQuery,
        highlightedProductId,
        handleSelectProduct,
    } = useProductSearch();
    /* ---------- UI ---------- */
    if (!id) {
        return <div className="p-4">Ошибка: sale_page_id отсутствует</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">
                Менеджер: {managerName ?? id}
            </h1>
            <div className="mb-4">
                <SearchBar
                    onSelect={handleSelectProduct}
                    query={searchQuery}
                    onQueryChange={setSearchQuery}
                />
            </div>

            <DateFilter
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
            />

            {loading && <p className="text-gray-500">Загрузка...</p>}

            {selectedDate && !loading && dailyRows.length > 0 && (
                <DailySalesTable
                    rows={dailyRows}
                    onHide={() => setSelectedDate(null)}
                />
            )}

            <SessionControlPanel
                salePageId={id}
                onFinishCallback={resetSalesAggregates}
                fetchProducts={fetchProducts}
                fetchSales={fetchSales}
                fetchEvents={fetchEvents}
            />

            <ProductTable
                salePageId={id}
                transactions={events}
                mode="sales"
                products={rowsForTable}
                editable
                onUpdate={handleUpdate}
                onEdit={() => {}}
                onDelete={() => {}}
                fetchProducts={fetchProducts}
                units={[]}
            />
        </div>
    );
}
