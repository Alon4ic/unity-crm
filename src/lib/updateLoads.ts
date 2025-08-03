// lib/updateLoads.ts
import { type Sale } from '@/lib/dexie/productsDB';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/dexie/productsDB';

/** Переносит load → total_loaded и сбрасывает load в ноль */
export async function normalizeLoads(salePageId: string) {
  /* 1. Читаем все необходимые столбцы — получаем полноценный Sale */
  const { data: rows, error } = await supabase
    .from('sales')
    .select(
      'id, product_id, sale_page_id, markup, return_qty, load, total_loaded, updated_at',
    )
    .eq('sale_page_id', salePageId)
    .gt('load', 0);

  if (error) throw error;
  if (!rows?.length) return; // нечего переносить

  /* 2. Формируем новые строки, оставляя все поля, кроме load / total_loaded */
  const now = new Date().toISOString();

  const updates: Sale[] = rows.map((r) => ({
    ...r,                                // все остальное без изменений
    load: 0,
    total_loaded: (r.total_loaded ?? 0) + r.load,
    updated_at: now,                     // фиксируем время изменения
  }));

  /* 3. Одним upsert в Supabase  */
  const { error: upErr } = await supabase
    .from('sales')
    .upsert(updates);                    // тип ровно Sale — ошибки нет

  if (upErr) throw upErr;

  /* 4. И тем же массивом — в Dexie */
  await db.sales.bulkPut(updates);
}
