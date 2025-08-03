
import type { Product } from '@/lib/dexie/productsDB';
import { supabase } from './client';


export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Ошибка при загрузке продуктов:', error.message);
    return [];
  }
  return data || [];
}
