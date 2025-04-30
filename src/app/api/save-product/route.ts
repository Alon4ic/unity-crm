import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Твой серверный Prisma клиент

export async function POST(req: Request) {
    try {
        const { code, name, unit, price, quantity } = await req.json();

        // Сохраняем товар в локальной БД
        await prisma.product.create({
            data: {
                code,
                name,
                unit,
                price,
                quantity,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[SAVE PRODUCT ERROR]', error);
        return NextResponse.json(
            { error: 'Ошибка при сохранении товара' },
            { status: 500 }
        );
    }
}
