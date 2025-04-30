import { deleteProduct, updateProduct } from '@/services/products';
import { NextRequest, NextResponse } from 'next/server';

// Интерфейс для типизации аргументов
interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
    const { id } = await params; // Разрешаем Promise
    const idNum = Number(id);
    const body = await req.json();

    try {
        await updateProduct(idNum, body);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }
        );
    }
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
    const { id } = await params; // Разрешаем Promise
    const idNum = Number(id);

    try {
        await deleteProduct(idNum);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }
        );
    }
}
