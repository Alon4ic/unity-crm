// app/api/unarchive-page/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ error: 'Нет id' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from('sale_pages')
        .update({ is_archived: false })
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
