import { supabase } from '@/lib/supabase/client';

export async function updateSalesMarkupInSupabase(salePageId: string, markup: number) {
  const { error } = await supabase
    .from('sales')
    .update({ markup_percent: markup })
    .eq('sale_page_id', salePageId);

  if (error) throw new Error('Ошибка Supabase: ' + error.message);
}
