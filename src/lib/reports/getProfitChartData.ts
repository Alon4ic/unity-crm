import dayjs from 'dayjs';
import { db } from '@/lib/dexie/productsDB';

export async function getProfitChartData(period: 'week' | 'month') {
    const fromDate =
        period === 'week'
            ? dayjs().subtract(7, 'day')
            : dayjs().subtract(1, 'month');

    const events = await db.product_events
        .filter((e) => dayjs(e.created_at).isAfter(fromDate))
        .toArray();

    const products = await db.products.toArray();
    const productMap = new Map(products.map((p) => [p.id, p]));

    const dayMap = new Map<string, number>(); // дата -> прибыль

    for (const event of events) {
        const product = productMap.get(event.product_id);
        if (!product || !product.price || !product.markup_percent) continue;

        const date = dayjs(event.created_at).format('YYYY-MM-DD');
        const price = product.price;
        const markup = product.markup_percent;
        const qty =
            event.type === 'delivery' ? event.quantity : -event.quantity;

        const profitPerItem = (price * markup) / 100;
        const totalProfit = profitPerItem * qty;

        dayMap.set(date, (dayMap.get(date) || 0) + totalProfit);
    }

    const sortedDates = Array.from(dayMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, profit]) => ({
            date,
            profit: Number(profit.toFixed(2)),
        }));

    return sortedDates;
}
