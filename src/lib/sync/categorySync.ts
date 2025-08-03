import { db } from '@/lib/dexie/productsDB'; // путь к твоему Dexie

import { v4 as uuidv4 } from 'uuid';
import { Category } from '@/lib/dexie/productsDB'; // путь к твоему интерфейсу Category
import { supabase } from '../supabase/client';

export async function addCategory(name: string) {

  const id = uuidv4();
  const created_at = new Date().toISOString();

  const newCategory: Category = { id, name, created_at };

  // Сначала Supabase
  const { error } = await supabase.from('categories').insert(newCategory);
  if (error) throw new Error('Ошибка Supabase: ' + error.message);

  // Потом Dexie
  await db.categories.add(newCategory);

  return newCategory;
}
