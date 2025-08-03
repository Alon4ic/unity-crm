'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    db,
    type Sale,
    type LoadTransaction,
    type Product,
    ExtendedProduct,
} from '@/lib/dexie/productsDB';
import { supabase } from '@/lib/supabase/client';
import { useLoadTransactions } from '@/hooks/useLoadTransactions';
import { syncSalePage } from '@/lib/sync/salePages';
import ProductTable from '@/components/ProductTable';
import toast from 'react-hot-toast';
import { SessionControlPanel } from '@/components/SessionControlPanel';
import DateFilter from '@/components/DateFilter';
import DailySalesTable from '@/components/DailySalesTable';
import { DailySalesRow } from '@/types';

const uuid = () => crypto.randomUUID();

export default function SalesIdPage() {
    const params = useParams();
    const id = params?.id as string | undefined;
    const salePageId = id as string;
    console.log(salePageId);
    const [managerName, setManagerName] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [showTable, setShowTable] = useState(false);
    const { transactions: loadTransactions } = useLoadTransactions();
    const [events, setEvents] = useState<LoadTransaction[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [dailyRows, setDailyRows] = useState<DailySalesRow[]>([]);
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
                        stock: prod.stock,
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
    const fetchProducts = useCallback(async () => {
        try {
            const isOnline = navigator.onLine;

            let rows: Product[] = [];
            if (isOnline) {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('name');

                if (error) throw error;

                rows = (data ?? []).map((p) => ({
                    ...p,
                    category: '',
                }));

                await db.products.clear();
                await db.products.bulkPut(rows);
            } else {
                rows = await db.products.toArray();
                if (!rows.length) {
                    toast('Нет данных о товарах в офлайн-режиме', {
                        icon: '⚠️',
                    });
                }
            }

            setProducts(rows);
        } catch (e) {
            console.error('[fetchProducts] Ошибка:', e);
            toast.error('Ошибка загрузки товаров');
        }
    }, []);

    /* ---------- Загрузка sales ---------- */
    const fetchSales = useCallback(async () => {
        if (!id) return;

        try {
            const isOnline = navigator.onLine;

            let rows: Sale[] = [];
            if (isOnline) {
                const { data, error } = await supabase
                    .from('sales')
                    .select(
                        'id,product_id,sale_page_id,load,return_qty,created_at,updated_at'
                    )
                    .eq('sale_page_id', id);

                if (error) throw error;

                rows = (data ?? []).map((r) => ({
                    id: r.id ?? uuid(),
                    product_id: r.product_id,
                    sale_page_id: r.sale_page_id,
                    load: r.load ?? 0,
                    return_qty: r.return_qty ?? 0,
                    created_at: r.created_at ?? new Date().toISOString(),
                    updated_at: r.updated_at ?? new Date().toISOString(),
                }));

                console.log(
                    `[fetchSales] Загружено из Supabase (${rows.length} записей):`,
                    rows
                );

                await db.sales.where('sale_page_id').equals(id).delete();
                await db.sales.bulkPut(rows);
                const dexieRows = await db.sales
                    .where('sale_page_id')
                    .equals(id)
                    .toArray();
                console.log(
                    `[fetchSales] Сохранено в Dexie (${dexieRows.length} записей):`,
                    dexieRows
                );
            } else {
                rows = await db.sales
                    .where('sale_page_id')
                    .equals(id)
                    .toArray();
                console.log(
                    `[fetchSales] Офлайн, загружено из Dexie (${rows.length} записей):`,
                    rows
                );

                if (!rows.length) {
                    toast('Нет данных о продажах в офлайн-режиме', {
                        icon: '⚠️',
                    });
                }
            }

            setSales(rows);
        } catch (e) {
            console.error('[fetchSales] Ошибка:', e);
            toast.error('Не удалось загрузить данные о продажах');
        }
    }, [id]);

    const fetchEvents = useCallback(async () => {
        if (!id) return;

        try {
            const isOnline = navigator.onLine;
            let rows: LoadTransaction[] = [];

            if (isOnline) {
                const { data, error } = await supabase
                    .from('load_transactions')
                    .select('*')
                    .eq('sale_page_id', id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                rows = data || [];

                console.log('[fetchEvents] Загружено из Supabase:', rows); // ✅ Логирование

                await db.transaction('rw', db.load_transactions, async () => {
                    await db.load_transactions
                        .where('sale_page_id')
                        .equals(id)
                        .delete();
                    if (rows.length) {
                        await db.load_transactions.bulkAdd(rows);
                    }
                });

                console.log('[fetchEvents] Сохранено в Dexie:', rows); // ✅ Логирование
            } else {
                rows = await db.load_transactions
                    .where('sale_page_id')
                    .equals(id)
                    .sortBy('created_at');

                console.log('[fetchEvents] Офлайн, загружено из Dexie:', rows); // ✅ Логирование
            }

            setEvents(rows);
        } catch (e) {
            console.error('[fetchEvents] Ошибка:', e);
            toast.error('Ошибка загрузки событий загрузки');
        }
    }, [id]);
    /* ---------- INIT ---------- */
    useEffect(() => {
        if (!id) {
            console.warn('[SalesIdPage] id отсутствует');
            return;
        }

        const init = async () => {
            console.log('[init] Инициализация с sale_page_id:', id);

            // Загружаем данные параллельно для ускорения
            await Promise.all([
                syncSalePage(id).then((p) => setManagerName(p?.name ?? null)),
                fetchProducts(),
                fetchSales(),
                fetchEvents(), // Добавляем загрузку событий
            ]);

            // Проверяем наличие всех данных
            const [dexieSales, dexieProducts, dexieEvents] = await Promise.all([
                db.sales.where('sale_page_id').equals(id).toArray(),
                db.products.toArray(),
                db.load_transactions.where('sale_page_id').equals(id).toArray(),
            ]);

            // Если какие-то данные отсутствуют и есть интернет - перезагружаем
            if (
                (!dexieSales.length ||
                    !dexieProducts.length ||
                    !dexieEvents.length) &&
                navigator.onLine
            ) {
                console.warn(
                    '[init] Неполные данные в Dexie, повторная синхронизация'
                );
                await Promise.all([
                    fetchProducts(),
                    fetchSales(),
                    fetchEvents(), // Повторно загружаем события
                ]);
            }
        };

        init();
    }, [id, fetchProducts, fetchSales, fetchEvents]);
    /* ---------- helpers ---------- */
    const saleMap = useMemo(
        () => new Map(sales.map((s) => [s.product_id, s])),
        [sales]
    );

    /* ---------- UPDATE (добавление транзакций) ---------- */
    const handleUpdate = async ({
        product_id,
        markup,
        load,
        return_qty,
    }: {
        product_id: string;
        markup: number;
        load: number | '';
        return_qty: number | '';
    }) => {
        const incLoad = Number(load || 0);
        const incReturn = Number(return_qty || 0);
        if (!incLoad && !incReturn) return;

        if (!id) {
            toast.error('sale_page_id отсутствует');
            return;
        }

        try {
            const isOnline = navigator.onLine;

            const prevTotals = totalsByProduct.get(product_id) ?? {
                total_loaded: 0,
                total_return: 0,
            };
            if (
                prevTotals.total_return + incReturn >
                prevTotals.total_loaded + incLoad
            ) {
                toast.error('Нельзя вернуть больше, чем было загружено');
                return;
            }

            const product = isOnline
                ? (
                      await supabase
                          .from('products')
                          .select('quantity,price,markup_percent')
                          .eq('id', product_id)
                          .single()
                  ).data
                : await db.products.get(product_id);

            if (!product) throw new Error('Товар не найден');

            const stockNow = product.quantity;
            const price = product.price;
            const markupPercent = markup ?? product.markup_percent ?? 0;

            const newQty = stockNow - incLoad + incReturn;
            if (newQty < 0) {
                toast.error('Отрицательный остаток товара недопустим');
                return;
            }

            const price_with_markup = price * (1 + markupPercent / 100);
            const timestamp = new Date().toISOString();
            const today = timestamp.slice(0, 10);

            // === 1. СОХРАНЯЕМ В load_transaction (история)
            const loadTx: LoadTransaction = {
                id: uuid(),
                sale_page_id: id,
                product_id,
                load: incLoad,
                return_qty: incReturn,
                markup: markupPercent,
                price,
                price_with_markup: price_with_markup,
                created_at: timestamp,
            };
            await db.load_transactions.add(loadTx);
            setEvents((prev) => [...prev, loadTx]);
            if (isOnline) {
                await supabase.from('load_transactions').insert(loadTx);
            }

            // === 2. ОБНОВЛЯЕМ / СОЗДАЕМ В sales (агрегат на день)
            const existing = await db.sales
                .where({ sale_page_id: id, product_id })
                .and((s) => s.created_at.slice(0, 10) === today)
                .first();

            const sale: Sale = {
                id: existing?.id ?? uuid(),
                sale_page_id: id,
                product_id,
                load: (existing?.load ?? 0) + incLoad,
                return_qty: (existing?.return_qty ?? 0) + incReturn,
                created_at: existing?.created_at ?? timestamp,
                updated_at: timestamp,
            };

            await db.sales.put(sale);
            setSales((prev) => {
                const others = prev.filter((s) => s.id !== sale.id);
                return [...others, sale];
            });

            if (isOnline) {
                const { data: remoteSales } = await supabase
                    .from('sales')
                    .select('*')
                    .eq('sale_page_id', id)
                    .eq('product_id', product_id)
                    .gte('created_at', today + 'T00:00:00')
                    .lt('created_at', today + 'T23:59:59');

                if (remoteSales && remoteSales.length > 0) {
                    const existingRemote = remoteSales[0];
                    await supabase
                        .from('sales')
                        .update({
                            load: existingRemote.load + incLoad,
                            return_qty: existingRemote.return_qty + incReturn,
                            updated_at: timestamp,
                        })
                        .eq('id', existingRemote.id);
                } else {
                    await supabase.from('sales').insert([sale]);
                }
            }

            // === 3. ОБНОВЛЯЕМ ОСТАТОК
            await db.products.update(product_id, { quantity: newQty });
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === product_id ? { ...p, quantity: newQty } : p
                )
            );
            if (isOnline) {
                await supabase
                    .from('products')
                    .update({ quantity: newQty })
                    .eq('id', product_id);
            }

            toast.success('Сохранено');
        } catch (err) {
            console.error('[handleUpdate] Ошибка:', err);
            toast.error('Ошибка сохранения');
        }
    };

    interface RowForTable extends ExtendedProduct {
        total_loaded: number;
        total_return: number;
        stock: number;
        salesSum: number;
        price_with_markup: number;
    }

    const rowsForTable: RowForTable[] = useMemo(() => {
        return products.map<RowForTable>((p) => {
            const totals = totalsByProduct.get(p.id) ?? {
                total_loaded: 0,
                total_return: 0,
            };
            const price = p.price ?? 0;
            const markup = p.markup_percent ?? 0;
            const markupValue = price * (markup / 100);
            const price_with_markup = price + markupValue;

            const totalLoaded = totals.total_loaded;
            const totalReturn = totals.total_return;
            const stock = totalLoaded - totalReturn;
            const salesSum = price_with_markup * stock;

            return {
                ...p,
                markup_percent: markup,
                markup: markupValue, // <== добавлено поле markup
                load: 0,
                return_qty: 0,
                total_loaded: totalLoaded,
                total_return: totalReturn,
                stock,
                salesSum,
                price_with_markup,
            };
        });
    }, [products, totalsByProduct]);

    /* ---------- Очистка транзакций для текущей страницы ---------- */
    const resetSalesAggregates = useCallback(async () => {
        if (!id) return;

        try {
            const isOnline = navigator.onLine;

            let transactions: LoadTransaction[] = [];

            if (isOnline) {
                const { data, error } = await supabase
                    .from('load_transactions')
                    .select(
                        'id,sale_page_id,product_id,load,return_qty,price,markup,price_with_markup,created_at'
                    )
                    .eq('sale_page_id', id);

                if (error) throw error;

                transactions = data ?? [];
                console.log(
                    `[resetSalesAggregates] Транзакции до очистки (Supabase, ${transactions.length} записей):`,
                    transactions
                );

                await db.load_transactions
                    .where('sale_page_id')
                    .equals(id)
                    .delete();
                await db.load_transactions.bulkPut(transactions);
            } else {
                transactions = await db.load_transactions
                    .where('sale_page_id')
                    .equals(id)
                    .toArray();
                console.log(
                    `[resetSalesAggregates] Транзакции до очистки (Dexie, офлайн, ${transactions.length} записей):`,
                    transactions
                );
            }

            await db.load_transactions
                .where('sale_page_id')
                .equals(id)
                .delete();
            console.log(
                '[resetSalesAggregates] Транзакции очищены в Dexie для sale_page_id:',
                id
            );

            if (isOnline) {
                const { error } = await supabase
                    .from('load_transactions')
                    .delete()
                    .eq('sale_page_id', id);

                if (error) throw error;
            } else {
                toast(
                    'Транзакции очищены локально, синхронизация недоступна в офлайн-режиме',
                    { icon: '⚠️' }
                );
            }

            setEvents((prev) => prev.filter((e) => e.sale_page_id !== id));
            await fetchProducts();

            toast.success('Транзакции текущей страницы очищены');
        } catch (e) {
            console.error('[resetSalesAggregates] Ошибка:', e);
            toast.error('Не удалось очистить транзакции');
        }
    }, [id, fetchProducts]);

    /* ---------- UI ---------- */
    if (!id) {
        return <div className="p-4">Ошибка: sale_page_id отсутствует</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">
                Менеджер: {managerName ?? id}
            </h1>

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
