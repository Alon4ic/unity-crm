import { createSupabaseServerClient } from '@/lib/supabase/server';
import SalesPageClient from '@/components/SalesPageClient';

export default async function Page({ params }: { params: { locale: string } }) {
    const { locale } = params;

    const supabase = await createSupabaseServerClient();

    const { data: pages, error } = await supabase
        .from('sale_pages')
        .select(
            `
    id, name, created_at, is_archived,
    sessions:manager_sessions(
      id, started_at, ended_at, total_sales_sum
    )
  `
        )
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Ошибка загрузки:', error);
        return (
            <div className="p-4 text-red-500">
                Ошибка загрузки страниц: {error.message}
            </div>
        );
    }

    const pagesFixed = (pages ?? []).map((p) => ({
        ...p,
        is_archived: p.is_archived ?? false, // ← важная строка
        sessions:
            p.sessions?.map((s) => ({
                ...s,
                ended_at: s.ended_at ?? '',
                total_sales_sum: s.total_sales_sum ?? 0,
            })) ?? [],
    }));
    return (
        <div className="p-4 space-y-4">
            <SalesPageClient pages={pagesFixed} locale={locale} />
        </div>
    );
}
