// src/app/api/sales/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/* ----------------------------------------------------------------------- */
/* GET /api/sales — список всех страниц                                    */
/* ----------------------------------------------------------------------- */
export async function GET() {
  const supabase = createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from('sale_pages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ pages: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* ----------------------------------------------------------------------- */
/* POST /api/sales — создать страницу                                      */
/* body: { name: string, user_id?: string, created_at?: string }           */
/* ----------------------------------------------------------------------- */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  try {
    const body = await req.json();

    /* --- валидация ------------------------------------------------------ */
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Имя обязательно' }, { status: 400 });
    }

    const pageName = body.name.trim();

    /* --- проверяем уникальность имени ---------------------------------- */
    const { data: existing } = await supabase
      .from('sale_pages')
      .select('id')
      .eq('name', pageName)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Страница с таким именем уже существует' },
        { status: 409 },
      );
    }

    /* --- вставляем запись; id генерирует Supabase ---------------------- */
    const { data, error } = await supabase
      .from('sale_pages')
      .insert({
        name:       pageName,
        user_id:    body.user_id || null,
        created_at: body.created_at || new Date().toISOString(),
      })
      .select()
      .single();            // вернёт строку с сгенерированным id

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    console.error('Ошибка создания sale_page:', e);
    return NextResponse.json(
      { error: e.message || 'Ошибка сервера' },
      { status: 500 },
    );
  }
}
