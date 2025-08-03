// src/app/api/sales/normalize/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(req.url);
  const salePageId = searchParams.get('sale_page_id');

  if (!salePageId) {
    return NextResponse.json({ error: 'sale_page_id is required' }, { status: 400 });
  }

  // атомарно переносим load ➜ total_loaded
  const { error } = await supabase.rpc('normalize_loads', {
    p_sale_page_id: salePageId,
  });

  if (error) {
    console.error('normalize_loads error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
