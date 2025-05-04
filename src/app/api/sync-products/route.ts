import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

export async function POST() {
    try {
        // Получаем все товары, которые ещё не синхронизированы
        const unsyncedProducts = await prisma.product.findMany({
            where: { synced: false },
        });

        if (!unsyncedProducts.length) {
            return NextResponse.json({
                message: 'Нет новых товаров для синхронизации',
            });
        }

        const inserts = unsyncedProducts.map((p) => ({
            id: p.id,
            name: p.name,
            code: p.code,
            unit: p.unit,
            price: p.price,
            quantity: p.quantity,
        }));

        const { error } = await supabaseAdmin.from('products').insert(inserts);

        if (error) {
            console.error('Ошибка Supabase:', error);
            return NextResponse.json({ error }, { status: 500 });
        }

        // Отмечаем как синхронизированные
        await prisma.product.updateMany({
            where: {
                id: { in: unsyncedProducts.map((p) => p.id) },
            },
            data: { synced: true },
        });

        return NextResponse.json({
            message: 'Синхронизация завершена',
            count: inserts.length,
        });
    } catch (error) {
        console.error('Ошибка при синхронизации:', error);
        return NextResponse.json({ error }, { status: 500 });
    }
}
