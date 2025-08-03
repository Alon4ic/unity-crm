import dayjs from 'dayjs';
import { db } from '@/lib/dexie/productsDB';

export type SalesReportRow = {
    name: string;
    code: string;
    unit: string;
    sold: number;
    cost: number;
    costWithMarkup: number;
    profit: number;
};

export async function getSalesReport(
    period: 'week' | 'month'
): Promise<SalesReportRow[]> {
    const fromDate =
        period === 'week'
            ? dayjs().subtract(7, 'day')
            : dayjs().subtract(1, 'month');

    const events = await db.product_events
        .filter((e) => dayjs(e.created_at).isAfter(fromDate))
        .toArray();

    const products = await db.products.toArray();

    const productMap = new Map<
        string,
        {
            name: string;
            code: string;
            unit: string;
            price: number;
            markup: number;
            deliveries: number;
            returns: number;
        }
    >();

    for (const p of products) {
        productMap.set(p.id, {
            name: p.name,
            code: p.code ?? '',
            unit: p.unit ?? '',
            price: p.price ?? 0,
            markup: p.markup_percent ?? 0,
            deliveries: 0,
            returns: 0,
        });
    }

    for (const event of events) {
        const entry = productMap.get(event.product_id);
        if (!entry) continue;
        if (event.type === 'delivery') entry.deliveries += event.quantity;
        if (event.type === 'return') entry.returns += event.quantity;
    }

    return Array.from(productMap.values())
        .map((entry) => {
            const sold = entry.deliveries - entry.returns;
            const cost = entry.price * sold;
            const priceWithMarkup = entry.price * (1 + entry.markup / 100);
            const costWithMarkup = priceWithMarkup * sold;
            const profit = costWithMarkup - cost;

            return {
                name: entry.name,
                code: entry.code,
                unit: entry.unit,
                sold,
                cost: Number(cost.toFixed(2)),
                costWithMarkup: Number(costWithMarkup.toFixed(2)),
                profit: Number(profit.toFixed(2)),
            };
        })
        .filter((row) => row.sold !== 0);
}

export async function getPeriodComparison(period: 'week' | 'month') {
    const now = dayjs();
    const startCurrent =
        period === 'week' ? now.subtract(7, 'day') : now.subtract(1, 'month');

    const startPrevious =
        period === 'week'
            ? startCurrent.subtract(7, 'day')
            : startCurrent.subtract(1, 'month');

    const currentEvents = await db.product_events
        .filter((e) => dayjs(e.created_at).isAfter(startCurrent))
        .toArray();

    const previousEvents = await db.product_events
        .filter(
            (e) =>
                dayjs(e.created_at).isAfter(startPrevious) &&
                dayjs(e.created_at).isBefore(startCurrent)
        )
        .toArray();

    const products = await db.products.toArray();
    const productMap = new Map(products.map((p) => [p.id, p]));

    function calculateProfit(events: typeof currentEvents) {
        let total = 0;
        for (const event of events) {
            const p = productMap.get(event.product_id);
            if (!p || !p.price || !p.markup_percent) continue;
            const qty =
                event.type === 'delivery' ? event.quantity : -event.quantity;
            const profitPerItem = (p.price * p.markup_percent) / 100;
            total += qty * profitPerItem;
        }
        return Number(total.toFixed(2));
    }

    const profitCurrent = calculateProfit(currentEvents);
    const profitPrevious = calculateProfit(previousEvents);

    const delta =
        profitPrevious > 0
            ? ((profitCurrent - profitPrevious) / profitPrevious) * 100
            : 0;

    return {
        profitCurrent,
        profitPrevious,
        delta: Number(delta.toFixed(2)),
    };
}
