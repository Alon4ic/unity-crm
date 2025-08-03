'use client';

import { useEffect, useState } from 'react';
import { categoriesDB, Category } from '@/lib/dexie/categoriesDB';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/dexie/productsDB';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  

  useEffect(() => {
    const fetchData = async () => {
      const local = await categoriesDB.categories.toArray();
      if (local.length) {
        setCategories(local);
      }

      const { data, error } = await supabase
        .from('categories')
        .select('id, name, color, created_at')
        .order('name');
      if (error) {
        console.error('Ошибка при загрузке категорий из Supabase:', error.message);
        return;
      }

      if (data) {
        setCategories(data);
        await categoriesDB.categories.clear();
        await categoriesDB.categories.bulkPut(data);
      }
    };

    fetchData();
  }, []);

  const addCategory = async (name: string, color: string) => {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, color }])
      .select('id, name, color, created_at')
      .single();

    if (error) {
      console.error('Ошибка при добавлении категории:', error.message);
      throw error;
    }

    if (data) {
      setCategories((prev) => [...prev, data]);
      await categoriesDB.categories.add(data);
      console.log('Добавляемая категория:', data);
      return data;
    }
  };

  const updateCategory = async (
  id: string,
  updates: Partial<{ name: string; color: string }>
) => {
  try {
    if (!updates.name && !updates.color) return; // ничего не менять

    // Обновление в Supabase
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    // Обновление в Dexie
    await categoriesDB.categories.update(id, updates);

    // Обновление в React-состоянии
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, ...updates } : cat
      )
    );

    console.log('Обновление категории:', updates);
  } catch (err) {
    console.error('Ошибка при обновлении категории:', err);
    throw err;
  }
};


  const deleteCategory = async (id: string, fetchProducts: () => Promise<void>) => {
  try {
    // Проверяем, существует ли категория
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .single();

    if (categoryError || !category) {
      console.error('Категория не найдена:', categoryError?.message);
      throw new Error('Категория не найдена');
    }

    // Находим все товары с category_id, равным удаляемой категории
    const { data: productsToUpdate, error: prodErr } = await supabase
      .from('products')
      .select('id')
      .eq('category_id', id);

    if (prodErr) {
      console.error('Ошибка при получении товаров:', prodErr.message);
      throw prodErr;
    }

    console.log('Товары для обновления:', productsToUpdate);

    // Обновляем товары в Supabase: сбрасываем category_id
    if (productsToUpdate && productsToUpdate.length > 0) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ category_id: null, updated_at: new Date().toISOString() })
        .in(
          'id',
          productsToUpdate.map((p) => p.id)
        );

      if (updateError) {
        console.error('Ошибка при обновлении товаров:', updateError.message);
        throw updateError;
      }

      // Обновляем товары в Dexie
      for (const product of productsToUpdate) {
        const updated = await db.products.update(product.id, {
          category_id: null,
          category: '',
        });
        if (updated === 0) {
          console.warn(`Товар с id ${product.id} не найден в Dexie`);
        }
      }
    } else {
      console.log('Товары с category_id не найдены');
    }

    // Удаляем категорию из Supabase
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Ошибка при удалении категории:', deleteError.message);
      throw deleteError;
    }

    // Удаляем категорию из Dexie
    await categoriesDB.categories.delete(id);

    // Обновляем состояние категорий
    setCategories((prev) => prev.filter((c) => c.id !== id));

    // Обновляем список товаров
    await fetchProducts();
  } catch (err) {
    console.error('Ошибка при удалении категории:');
    throw err;
  }
};

  return { categories, addCategory, updateCategory, deleteCategory };
}
