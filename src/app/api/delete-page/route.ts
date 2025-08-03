import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
    const { id } = await request.json();

    try {
        

        // Удаляем страницу
        const { error } = await supabase
            .from('sale_pages')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Ошибка удаления страницы' },
            { status: 500 }
        );
    }
}
