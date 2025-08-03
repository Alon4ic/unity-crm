'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/dexie/productsDB';

interface Session {
    id: string;
    started_at: string;
    ended_at: string | null;
    total_sales_sum: number | null;
}

export interface Page {
    id: string;
    name: string;
    created_at: string | null;
    is_archived: boolean;
    sessions?: Session[];
}

export function useSalePages(serverPages: Page[], showArchived: boolean) {
    const [pages, setPages] = useState<Page[]>([]);

    useEffect(() => {
        const loadPages = async () => {
            let result: Page[] = [];

            if (navigator.onLine) {
                // Онлайн: фильтруем серверные страницы
                result = showArchived
                    ? serverPages
                    : serverPages.filter((p) => !p.is_archived);
            } else {
                // Оффлайн: загружаем страницы из IndexedDB
                try {
                    result = showArchived
                        ? await db.sale_pages.toArray()
                        : await db.sale_pages
                              .where('is_archived')
                              .equals(0)
                              .toArray();
                } catch (err) {
                    console.error('Ошибка при загрузке страниц из Dexie:', err);
                }
            }

            setPages(result);
        };

        loadPages();
    }, [serverPages, showArchived]);

    return {
        pages,
        activePages: pages.filter((p) => !p.is_archived),
        archivedPages: pages.filter((p) => p.is_archived),
        setPages,
    };
}
