import { db } from '@/lib/dexie/productsDB';
import dayjs from 'dayjs';

export type StockReportRow = {
    name: string;
    code: string;
    unit: string;
    initial: number; // Кол-во на начало периода
    delivered: number;
    returned: number;
    sold: number;
    current: number; // текущий остаток
};

export async function getStockReport(
    period: 'week' | 'month'
): Promise<StockReportRow[]> {
    const now = dayjs();
    const fromDate =
        period === 'week' ? now.subtract(7, 'day') : now.subtract(1, 'month');

    const [products, events] = await Promise.all([
        db.products.toArray(),
        db.product_events.toArray(),
    ]);

    const reportMap = new Map<string, StockReportRow>();

    for (const product of products) {
        reportMap.set(product.id, {
            name: product.name,
            code: product.code ?? '',
            unit: product.unit ?? '',
            initial: product.quantity ?? 0, // временно присваиваем текущее, позже пересчитаем
            delivered: 0,
            returned: 0,
            sold: 0,
            current: product.quantity ?? 0,
        });
    }

    for (const event of events) {
        const row = reportMap.get(event.product_id);
        if (!row) continue;

        const date = dayjs(event.created_at);
        const qty = event.quantity;

        if (date.isAfter(fromDate)) {
            if (event.type === 'delivery') {
                row.delivered += qty;
                row.initial -= qty;
            }
            if (event.type === 'return') {
                row.returned += qty;
                row.initial += qty;
            }
        }
    }

    for (const row of reportMap.values()) {
        row.sold = row.initial + row.delivered - row.returned - row.current;
    }

    return Array.from(reportMap.values());
}
