// src/app/api/sync-products/route.ts

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST() {
    const supabase = await createSupabaseServerClient();

    // Здесь ваша логика синхронизации:
    const { data, error } = await supabase.from('products').select('*'); // Пример, можно заменить на вашу sync-логику

    if (error) {
        console.error('Ошибка при получении продуктов:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }

    // Вернём результат
    return NextResponse.json({ success: true, data });
}
