import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    // 1. Получаем локальные товары от клиента
    let localProducts: Database['public']['Tables']['products']['Insert'][] =
        [];
    try {
        localProducts = await req.json();
    } catch {
        return NextResponse.json(
            { error: 'Неверный JSON в теле запроса' },
            { status: 400 }
        );
    }

    // 2. Получаем товары из Supabase
    const { data: serverProducts, error: fetchError } = await supabase
        .from('products')
        .select('*');

    if (fetchError) {
        return NextResponse.json(
            { error: fetchError.message },
            { status: 500 }
        );
    }

    // 3. Сопоставляем структуру (опционально — если поля отличаются)
    const serverMap = new Map(serverProducts.map((p) => [p.id, p]));

    const mergedProducts: Database['public']['Tables']['products']['Insert'][] =
        [];

    for (const local of localProducts) {
        const server = serverMap.get(local.id);

        if (!server) {
            // Новый товар — добавить
            mergedProducts.push(local);
        } else {
            // Сравниваем даты обновления (если есть поле updated_at)
            if (
                local.updated_at &&
                server.updated_at &&
                new Date(local.updated_at) > new Date(server.updated_at)
            ) {
                mergedProducts.push(local);
            }
        }
    }

    // 4. Объединённые товары добавляем/обновляем через upsert
    const { error: upsertError } = await supabase
        .from('products')
        .upsert(mergedProducts, { onConflict: 'id' });

    if (upsertError) {
        console.error('Ошибка при upsert:', upsertError);
        return NextResponse.json(
            { error: upsertError.message },
            { status: 400 }
        );
    }

    return NextResponse.json({
        message: '✅ Синхронизация завершена успешно',
        uploaded: mergedProducts.length,
    });
}
