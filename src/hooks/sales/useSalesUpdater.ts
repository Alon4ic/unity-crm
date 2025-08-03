import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { db, type LoadTransaction, type Sale } from '@/lib/dexie/productsDB';
import { supabase } from '@/lib/supabase/client';
import { v4 as uuid } from 'uuid'; // удобный генератор id

interface UseSalesUpdaterOptions {
    salePageId: string | undefined;
    totalsByProduct: Map<
        string,
        { total_loaded: number; total_return: number }
    >;
    setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
    setEvents: React.Dispatch<React.SetStateAction<LoadTransaction[]>>;
    setProducts: React.Dispatch<React.SetStateAction<any>>; // Product[] — замени на свой тип
}

/**  Хук, который возвращает функцию handleUpdate */
export function useSalesUpdater({
    salePageId,
    totalsByProduct,
    setSales,
    setEvents,
    setProducts,
}: UseSalesUpdaterOptions) {
    const handleUpdate = useCallback(
        async ({
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

            if (!salePageId) {
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

                /* ---------- 1. Получаем продукт ---------- */
                const product = isOnline
                    ? (
                          await supabase
                              .from('products')
                              .select('quantity,price,markup_percent')
                              .eq('id', product_id)
                              .single()
                      ).data
                    : await db.products.get(product_id);

                if (!product) {
                    toast.error('Товар не найден');
                    return;
                }

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

                /* ---------- 2. Записываем load_transaction ---------- */
                const loadTx: LoadTransaction = {
                    id: uuid(),
                    sale_page_id: salePageId,
                    product_id,
                    load: incLoad,
                    return_qty: incReturn,
                    markup: markupPercent,
                    price,
                    price_with_markup,
                    created_at: timestamp,
                };

                await db.load_transactions.add(loadTx);
                setEvents((prev) => [...prev, loadTx]);
                if (isOnline) {
                    await supabase.from('load_transactions').insert(loadTx);
                }

                /* ---------- 3. Обновляем (или создаём) запись в sales ---------- */
                const existing = await db.sales
                    .where({ sale_page_id: salePageId, product_id })
                    .and((s) => s.created_at.slice(0, 10) === today)
                    .first();

                const sale: Sale = {
                    id: existing?.id ?? uuid(),
                    sale_page_id: salePageId,
                    product_id,
                    load: (existing?.load ?? 0) + incLoad,
                    return_qty: (existing?.return_qty ?? 0) + incReturn,
                    created_at: existing?.created_at ?? timestamp,
                    updated_at: timestamp,
                    created_date: existing?.created_at ?? timestamp,
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
                        .eq('sale_page_id', salePageId)
                        .eq('product_id', product_id)
                        .gte('created_at', `${today}T00:00:00`)
                        .lt('created_at', `${today}T23:59:59`);

                    if (remoteSales && remoteSales.length > 0) {
                        const existingRemote = remoteSales[0];
                        await supabase
                            .from('sales')
                            .update({
                                load: (existingRemote.load ?? 0) + incLoad,
                                return_qty:
                                    (existingRemote.return_qty ?? 0) +
                                    incReturn,
                                updated_at: timestamp,
                            })
                            .eq('id', existingRemote.id);
                    } else {
                        await supabase.from('sales').insert([sale]);
                    }
                }

                /* ---------- 4. Обновляем остаток товара ---------- */
                await db.products.update(product_id, { quantity: newQty });
                setProducts((prev: any[]) =>
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
        },
        [salePageId, totalsByProduct, setSales, setEvents, setProducts]
    );

    return { handleUpdate };
}
