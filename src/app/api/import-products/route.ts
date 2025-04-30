import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Путь к Prisma клиенту
import * as XLSX from 'xlsx'; // 👈 Импортируем XLSX

export async function POST(req: Request) {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer()); // 👈 Преобразуем файл в буфер
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    const products = json.map((item: any) => ({
        code: item['Код'] || null,
        name: item['Наименование'] || '',
        unit: item['Единица'] || 'шт',
        price: parseFloat(item['Цена'] || 0),
        quantity: parseInt(item['Количество'] || '0', 10),
    }));

    try {
        for (const product of products) {
            await prisma.product.create({ data: product });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[IMPORT PRODUCTS ERROR]', error);
        return NextResponse.json(
            { error: 'Ошибка при сохранении данных' },
            { status: 500 }
        );
    }
}
