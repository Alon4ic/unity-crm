// src/hooks/useSyncSalePages.ts
'use client';

import { SalePage, db } from '@/lib/dexie/productsDB';
import { useEffect, useState } from 'react';


export function useSyncSalePages() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = async () => {
      try {
        const res = await fetch('/api/sales-pages'); // отдельный API-роут
        const json = await res.json();

        if (json.error) throw new Error(json.error);

        const pages: SalePage[] = json.pages;

        // Сохраняем в Dexie (можно с очисткой)
        await db.sale_pages.clear();
        await db.sale_pages.bulkPut(pages);
      } catch (error) {
        console.error('Ошибка синхронизации sale_pages:', error);
      } finally {
        setLoading(false);
      }
    };

    sync();
  }, []);

  return { loading };
}
