import { useEffect, useState } from 'react';
import { fetchLoadTransactionsFromSupabase } from '@/lib/supabase/fetchLoadTransactionsFromSupabase';
import { fetchLoadTransactionsFromDexie }    from '@/lib/dexie/fetchLoadTransactionsFromDexie';
import { LoadTransaction }                   from '@/lib/dexie/productsDB'; // ← тот же интерфейс

export function useLoadTransactions() {
  const [transactions, setTransactions] = useState<LoadTransaction[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const online = navigator.onLine;
        const data   = online
          ? await fetchLoadTransactionsFromSupabase()
          : await fetchLoadTransactionsFromDexie();

        setTransactions(data);
      } catch (err) {
        console.error('Ошибка при получении loadTransactions:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { transactions, loading };
}