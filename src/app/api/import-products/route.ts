import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { saveImportProduct } from '@/lib/saveImportProduct';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = await saveImportProduct(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Ошибка в POST /api/import-products:', error);
        return NextResponse.json(
            { success: false, error: 'Ошибка при импорте' },
            { status: 400 }
        );
    }
}

// 👇 Добавь обработку GET-запросов
export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error('Ошибка в GET /api/import-products:', error);
        return NextResponse.json(
            { error: 'Ошибка загрузки товаров' },
            { status: 500 }
        );
    }
}
