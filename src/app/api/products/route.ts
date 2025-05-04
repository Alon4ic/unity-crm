// app/api/products/route.ts
import { NextResponse } from 'next/server';
import type { ProductInput } from '@/app/hooks/useProducts';
import prisma from '@/lib/prisma';

// Обработчик POST (добавление товара)
export async function POST(req: Request) {
    const body = (await req.json()) as ProductInput;

    try {
        const newProduct = await prisma.product.create({
            data: {
                name: body.name,
                code: body.code || null,
                unit: body.unit,
                price: body.price,
                quantity: body.quantity,
            },
        });

        return NextResponse.json(newProduct);
    } catch (error) {
        console.error('Ошибка при добавлении в Prisma:', error);
        return NextResponse.json(
            { error: 'Ошибка при добавлении товара' },
            { status: 500 }
        );
    }
}

// ✅ Обработчик GET (получение списка товаров)
export async function GET() {
    try {
        const products = await prisma.product.findMany();
        return NextResponse.json(products);
    } catch (error) {
        console.error('Ошибка при получении товаров:', error);
        return NextResponse.json(
            { error: 'Ошибка при загрузке товаров' },
            { status: 500 }
        );
    }
}
