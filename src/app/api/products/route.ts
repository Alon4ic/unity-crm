import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Получение всех продуктов
export async function GET() {
    try {
        const { data, error } = await supabase.from('products').select('*');

        if (error) {
            return NextResponse.json(
                { message: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        );
    }
}

// Добавление нового продукта
export async function POST(req: Request) {
    try {
        const { name_code, unit_id, price, tax_rate_id, markup_rate_id } =
            await req.json();

        const { data, error } = await supabase
            .from('products')
            .insert([
                { name_code, unit_id, price, tax_rate_id, markup_rate_id },
            ])
            .select();

        if (error) {
            return NextResponse.json(
                { message: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(data[0], { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'Failed to add product' },
            { status: 500 }
        );
    }
}

// Обновление существующего продукта
export async function PUT(req: Request) {
    try {
        const { id, name_code, unit_id, price, tax_rate_id, markup_rate_id } =
            await req.json();

        if (!id) {
            return NextResponse.json(
                { message: 'Product ID is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('products')
            .update({ name_code, unit_id, price, tax_rate_id, markup_rate_id })
            .eq('id', id)
            .select();

        if (error) {
            return NextResponse.json(
                { message: error.message },
                { status: 500 }
            );
        }

        if (!data || data.length === 0) {
            return NextResponse.json(
                { message: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(data[0], { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'Failed to update product' },
            { status: 500 }
        );
    }
}

// Удаление продукта
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json(
                { message: 'Product ID is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            return NextResponse.json(
                { message: error.message },
                { status: 500 }
            );
        }

        if (!data || data.length === 0) {
            return NextResponse.json(
                { message: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Product deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'Failed to delete product' },
            { status: 500 }
        );
    }
}
