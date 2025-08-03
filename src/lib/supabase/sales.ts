import { supabase } from '@/lib/supabase/client'; // или server, если с сервера вызываешь

export async function upsertSale({
  product_id,
  sale_page_id,
  load,
  markup,
  return_qty,
}: {
  product_id: string;
  sale_page_id: string;
  load?: number;
  markup?: number;
  return_qty?: number;
}) {
  const { data, error } = await supabase
    .from('sales')
    .upsert({
      product_id,
      sale_page_id,
      load,
      markup,
      return_qty,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'product_id,sale_page_id' }) // 👈 важно!
    .select();

  if (error) {
    throw error;
  }

  return data;
}
