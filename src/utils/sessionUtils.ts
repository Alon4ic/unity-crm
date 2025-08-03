// lib/sessionUtils.ts
import { supabase } from '@/lib/supabase/client';

/**
 * Подсчитывает итоги (load, return_qty, sales_sum) для заданной сессии.
 * Берёт все load_transactions, у которых
 *   sale_page_id = salePageId
 *   created_at >= startedAt AND created_at <= endedAt
 */
export async function getSessionTotals(
  salePageId: string,
  startedAt: string,
  endedAt: string
): Promise<{ total_load: number; total_return: number; total_sales_sum: number }> {
  // Запрашиваем только записи load_transactions за диапазон дат
  const { data, error } = await supabase
    .from('load_transactions')
    .select('load, return_qty, price_with_markup')
    .eq('sale_page_id', salePageId)
    .gte('created_at', startedAt)
    .lte('created_at', endedAt);

  if (error) {
    console.error('Ошибка при получении транзакций для сессии:', error);
    throw error;
  }

  // Сворачиваем полученные транзакции в суммарные значения
  const totals = (data || []).reduce(
    (acc, row: { load: number | null; return_qty: number | null; price_with_markup: number | null }) => {
      const load   = row.load ?? 0;
      const ret    = row.return_qty ?? 0;
      const price  = row.price_with_markup ?? 0;
      acc.total_load         += load;
      acc.total_return       += ret;
      acc.total_sales_sum    += (load - ret) * price;
      return acc;
    },
    { total_load: 0, total_return: 0, total_sales_sum: 0 }
  );

  return totals;
}
