import { supabase } from '@/lib/supabase/client';
import { LoadTransaction } from '@/lib/dexie/productsDB';

export async function fetchLoadTransactionsFromSupabase(): Promise<LoadTransaction[]> {
  const { data, error } = await supabase
    .from('load_transactions')
    .select('*');

  if (error) {
    console.error(error);
    return [];
  }
  return data as LoadTransaction[];
}