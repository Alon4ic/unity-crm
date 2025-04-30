import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Интерфейс для типизации аргументов
interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
    const { id } = await params; // Разрешаем Promise
    const idNum = parseInt(id);
    const { name, phone, email, type, address } = await req.json();

    const { data, error } = await supabase
        .from('clients')
        .update({ name, phone, email, type, address })
        .eq('id', idNum)
        .select();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    if (!data || data.length === 0) {
        return NextResponse.json(
            { message: 'Client not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(data[0], { status: 200 });
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
    const { id } = await params; // Разрешаем Promise
    const idNum = parseInt(id);

    const { data, error } = await supabase
        .from('clients')
        .delete()
        .eq('id', idNum)
        .select();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    if (!data || data.length === 0) {
        return NextResponse.json(
            { message: 'Client not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(
        { message: 'Client deleted successfully' },
        { status: 200 }
    );
}
