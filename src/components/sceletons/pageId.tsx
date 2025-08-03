'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    db,
    type Sale,
    type LoadTransaction,
    type Product,
} from '@/lib/dexie/productsDB';
import { supabase } from '@/lib/supabase/client';
import { useLoadTransactions } from '@/hooks/useLoadTransactions';
import ProductTable from '@/components/ProductTable';
import toast from 'react-hot-toast';
import { SessionControlPanel } from '@/components/SessionControlPanel';
import DateFilter from '@/components/DateFilter';
import DailySalesTable from '@/components/DailySalesTable';
import { DailySalesRow, ExtendedProduct } from '@/types';
import SearchBar from '@/components/SearchBar';
import useProductSearch from '@/hooks/useProductSearch';
import { useSalesProducts } from '@/hooks/sales/useSalesProducts';
import { useSalesFetcher } from '@/hooks/sales/useSalesFetcher';
import { useLoadEventsFetcher } from '@/hooks/sales/useLoadEventsFetcher';
import { useSalesUpdater } from '@/hooks/sales/useSalesUpdater';
import { useSalesPageInit } from '@/hooks/sales/useSalesPageInit';
import { useTotalsByProduct } from '@/hooks/sales/useTotalsByProduct';
import { useRowsForSalesTable } from '@/hooks/sales/useRowsForSalesTable';
import { useResetSalesAggregates } from '@/hooks/useResetSalesAggregates';
import { useDailyRows } from '@/hooks/sales/useDailyRows';

export default function SalesIdPage() {
    const params = useParams();
    const id = params?.id as string | undefined;
    const salePageId = id as string;
    console.log(salePageId);
    const [managerName, setManagerName] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const { fetchProducts } = useSalesProducts(salePageId, setProducts);
    const [sales, setSales] = useState<Sale[]>([]);
    const { transactions: loadTransactions } = useLoadTransactions();
    const [events, setEvents] = useState<LoadTransaction[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadAll() {
            try {
                const isOnline = navigator.onLine;
                let salesData: Sale[] = [];
                let productsData: Product[] = [];

                if (isOnline) {
                    const { data: sData, error: sErr } = await supabase
                        .from('sales')
                        .select('*')
                        .eq('sale_page_id', salePageId);
                    if (sErr) throw sErr;
                    salesData = sData as Sale[];

                    const { data: pData, error: pErr } = await supabase
                        .from('products')
                        .select('*');
                    if (pErr) throw pErr;
                    productsData = pData as Product[];
                } else {
                    salesData = await db.sales
                        .where('sale_page_id')
                        .equals(salePageId)
                        .toArray();
                    productsData = await db.products.toArray();
                }

                setSales(salesData);
                setProducts(productsData);
            } catch (err) {
                console.error('Ошибка загрузки данных для daily:', err);
                toast.error('Не удалось загрузить данные');
            }
        }
        loadAll();
    }, [salePageId]);

    // Группировка по выбранной дате
    const { dailyRows, showTable } = useDailyRows(
        selectedDate,
        sales,
        products
    );

    /* ---------- Вычисление total_loaded и total_return ---------- */
    //вынесено
    const totalsByProduct = useTotalsByProduct(sales);

    /* ---------- Загрузка товаров ---------- */
    // Вынесено
	
    /* ---------- Загрузка sales ---------- */
    //Вынесено
    const { fetchSales } = useSalesFetcher(id, setSales);

    const { fetchEvents } = useLoadEventsFetcher(id, setEvents);

    /* ---------- INIT ---------- */
    useSalesPageInit({
        salePageId: id,
        fetchProducts,
        fetchSales,
        fetchEvents,
    });

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
