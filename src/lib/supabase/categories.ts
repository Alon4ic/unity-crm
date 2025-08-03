import { supabase } from "./client";

export async function addCategoryToSupabase(name: string) {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
