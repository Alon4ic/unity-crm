'use client';

import { categoriesDB } from '@/lib/dexie/categoriesDB';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'react-hot-toast';

export default function DexieCategoriesViewer() {
  // Подписка на локальные категории из Dexie
  const categories = useLiveQuery(() => categoriesDB.categories.toArray(), []);


  // Функция очистки таблицы категорий
  const clearCategories = async () => {
    try {
      await categoriesDB.categories.clear();
      toast.success('✅ Локальные категории очищены');
    } catch (error) {
      toast.error('❌ Ошибка при очистке категорий');
      console.error('Ошибка очистки категорий:', error);
    }
  };

  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-md font-semibold">Локальные категории (Dexie)</h2>
        <button
          onClick={clearCategories}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
        >
          Очистить всё
        </button>
      </div>

      {!categories || categories.length === 0 ? (
        <p className="text-sm text-gray-600">Нет данных в локальном хранилище</p>
      ) : (
        <ul className="space-y-1 max-h-48 overflow-y-auto text-sm text-gray-800">
          {categories.map((cat) => (
            <li key={cat.id}>
              <span className="font-medium">{cat.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
