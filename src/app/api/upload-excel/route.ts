import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { supabase } from '@/lib/supabase';

// Интерфейс для структуры данных продукта из Excel
interface Product {
    name_code: string;
    unit_id: number;
    price: number;
    quantity: number;
    acceptable_quantity: number;
    critical_quantity: number;
    required_quantity: number;
}

export async function POST(req: NextRequest) {
    try {
        // Проверяем, что запрос содержит файл
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Читаем файл как ArrayBuffer
        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        // Получаем первый лист
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
            return NextResponse.json(
                { error: 'No worksheets found in the Excel file' },
                { status: 400 }
            );
        }

        // Читаем данные из листа
        const products: Product[] = [];
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return; // Пропускаем заголовок

            const product: Product = {
                name_code: String(row.getCell(1).value || ''),
                unit_id: Number(row.getCell(2).value || 0),
                price: Number(row.getCell(3).value || 0),
                quantity: Number(row.getCell(4).value || 0),
                acceptable_quantity: Number(row.getCell(5).value || 0),
                critical_quantity: Number(row.getCell(6).value || 0),
                required_quantity: Number(row.getCell(7).value || 0),
            };

            products.push(product);
        });

        // Сохраняем продукты в Supabase
        for (const product of products) {
            const { error } = await supabase.from('products').insert(product);
            if (error) {
                return NextResponse.json(
                    {
                        error: `Failed to insert product ${product.name_code}: ${error.message}`,
                    },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json(
            {
                message: 'Products imported successfully',
                count: products.length,
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                error: `Failed to process Excel file: ${
                    (error as Error).message
                }`,
            },
            { status: 500 }
        );
    }
}
