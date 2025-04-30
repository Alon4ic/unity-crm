import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Интерфейс для типизации аргументов
interface RouteParams {
    params: Promise<{ id: string }>;
}

// Обработка GET-запроса (получение клиента по ID)
export async function GET(_: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params; // Разрешаем Promise

        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return NextResponse.json(
                { message: error.message },
                { status: 500 }
            );
        }

        return data
            ? NextResponse.json(data, { status: 200 })
            : NextResponse.json(
                  { message: 'Client not found' },
                  { status: 404 }
              );
    } catch (error) {
        return NextResponse.json(
            { message: 'Something went wrong', error },
            { status: 500 }
        );
    }
}

// Обработка PUT-запроса (обновление клиента)
export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params; // Разрешаем Promise
        const { name, phone, email, type, address } = await req.json();

        // Проверка ID
        if (!id) {
            return NextResponse.json(
                { message: 'Client ID is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('clients')
            .update({ name, phone, email, type, address })
            .eq('id', id)
            .select();

        if (error) {
            return NextResponse.json(
                { message: error.message },
                { status: 500 }
            );
        }

        return data?.length
            ? NextResponse.json(data[0], { status: 200 })
            : NextResponse.json(
                  { message: 'Client not found' },
                  { status: 404 }
              );
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to update client', error },
            { status: 500 }
        );
    }
}

// Обработка DELETE-запроса (удаление клиента)
export async function DELETE(_: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params; // Разрешаем Promise

        // Проверка ID
        if (!id) {
            return NextResponse.json(
                { message: 'Client ID is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            return NextResponse.json(
                { message: error.message },
                { status: 500 }
            );
        }

        return data?.length
            ? NextResponse.json({ message: 'Client deleted' }, { status: 200 })
            : NextResponse.json(
                  { message: 'Client not found' },
                  { status: 404 }
              );
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to delete client', error },
            { status: 500 }
        );
    }
}
