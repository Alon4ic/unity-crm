import { useEffect } from 'react';
import { db } from '@/lib/dexie/productsDB';
import { syncSalePage } from '@/lib/sync/salePages';

interface UseSalesPageInitProps {
    salePageId?: string;
    fetchProducts: () => Promise<void>;
    fetchSales: () => Promise<void>;
    fetchEvents: () => Promise<void>;
    setManagerName?: (name: string | null) => void;
}

export function useSalesPageInit({
    salePageId,
    fetchProducts,
    fetchSales,
    fetchEvents,
    setManagerName,
}: UseSalesPageInitProps) {
    useEffect(() => {
        if (!salePageId) {
            console.warn('[SalesPageInit] salePageId отсутствует');
            return;
        }

        const init = async () => {
            console.log('[init] Инициализация с sale_page_id:', salePageId);

            try {
                // Параллельно загружаем все
                const syncPromise = syncSalePage(salePageId).then((page) =>
                    setManagerName?.(page?.name ?? null)
                );

                await Promise.all([
                    syncPromise,
                    fetchProducts(),
                    fetchSales(),
                    fetchEvents(),
                ]);

                // Проверяем локальные данные (Dexie)
                const [dexieSales, dexieProducts, dexieEvents] =
                    await Promise.all([
                        db.sales
                            .where('sale_page_id')
                            .equals(salePageId)
                            .toArray(),
                        db.products.toArray(),
                        db.load_transactions
                            .where('sale_page_id')
                            .equals(salePageId)
                            .toArray(),
                    ]);

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
                        fetchEvents(),
                    ]);
                }
            } catch (err) {
                console.error('[init] Ошибка инициализации:', err);
            }
        };

        init();
    }, [salePageId, fetchProducts, fetchSales, fetchEvents, setManagerName]);
}