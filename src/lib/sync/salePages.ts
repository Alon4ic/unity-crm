import { db, type SalePage } from '@/lib/dexie/productsDB';
import { supabase } from '@/lib/supabase/client';

/**
 * Универсальная функция синхронизации sale_page по id.
 * Сначала пытается загрузить из Supabase, затем — из Dexie.
 * @param id ID страницы продаж
 * @returns Объект SalePage или null
 */
export async function syncSalePage(id: string): Promise<SalePage | null> {
    try {
        // Пробуем загрузить из Supabase
        const { data, error } = await supabase
            .from('sale_pages')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.warn('[syncSalePage] Supabase error or no data:', error);
            // Переход в оффлайн-режим
            const local = await db.sale_pages.get(id);
            return local ?? null;
        }

        const salePage: SalePage = {
            id: data.id,
            name: data.name,
            created_at: data.created_at,
            is_archived: false
        };

        // Сохраняем в Dexie
        await db.sale_pages.put(salePage);
        return salePage;
    } catch (err) {
        console.error('[syncSalePage] Ошибка:', err);
        const local = await db.sale_pages.get(id);
        return local ?? null;
    }
}
