import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // путь к вашему клиенту Supabase
import toast from 'react-hot-toast';


export interface ProductDailyTotal {
  sale_page_id: string;
  product_id: string;
  product_name: string;
  price_with_markup: number;
  date: string;
  total_load: number;
  total_return: number;
}

export function useProductDailyTotals(salePageId: string | null) {
  const [data, setData] = useState<ProductDailyTotal[]>([]);
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    if (!salePageId) return;

    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('v_product_daily_totals')
        .select('*')
        .eq('sale_page_id', salePageId);

      if (error) {
        console.error(error);
        toast.error('Не удалось получить загрузки по дням');
      } else {
        setData(data);
      }

      setLoading(false);
    };

    fetchData();
  }, [salePageId]);

  return { data, loading };
}
