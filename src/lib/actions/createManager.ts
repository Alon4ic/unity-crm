// lib/actions/createManager.ts
import { supabase } from '@/lib/supabase/client';
import { db } from '@/lib/dexie/productsDB';

export async function createManager(name: string) {
  // 1) Вставляем новую запись в таблицу sale_pages в Supabase
  const { data, error } = await supabase
    .from('sale_pages')
    .insert({ name })
    .select() // чтобы получить вновь созданную строку, включая id и created_at
    .single();

  if (error) {
    throw error;
  }

  // 2) Сохраняем ту же запись в IndexedDB (Dexie) для офлайн-режима
  // Здесь важно, чтобы у интерфейса SalePage был флаг is_archived (по умолчанию false)
  await db.sale_pages.add({
    id:           data.id,
    name:         data.name,
    created_at:   data.created_at,
    is_archived:  false,
  });

  return data;
}
