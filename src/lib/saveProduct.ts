'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { Product } from 'electron';

interface ProductInput {
    code?: string;
    name: string;
    unit: string;
    price: number;
    quantity: number;
}

export async function saveProduct(product: ProductInput): Promise<{
    success: boolean;
    data?: Product;
    error?: string;
}> {
    try {
        const supabase = await createSupabaseServerClient();

        const { data, error: supabaseError } = await supabase
            .from('products')
            .insert([
                {
                    code: product.code || null,
                    name: product.name,
                    unit: product.unit,
                    price: product.price,
                    quantity: product.quantity,
                },
            ])
            .select(); // 🔥 Получаем добавленную строку

        if (supabaseError) {
            console.error('Ошибка Supabase:', supabaseError);
            return { success: false, error: supabaseError.message };
        }

        // Сохраняем также локально с флагом synced: false
        await prisma.product.create({
            data: {
                code: product.code || null,
                name: product.name,
                unit: product.unit,
                price: product.price,
                quantity: product.quantity,
                synced: false, // 👈 Добавлено
            },
        });

        return { success: true, data: data?.[0] };
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        return { success: false, error: (error as Error).message };
    }
}

// 'use server';

// import { createSupabaseServerClient } from '@/lib/supabase/server';
// import prisma from '@/lib/prisma';
// import { Product } from 'electron';

// interface ProductInput {
//     code?: string;
//     name: string;
//     unit: string;
//     price: number;
//     quantity: number;
// }

// export async function saveProduct(product: ProductInput): Promise<{
//     success: boolean;
//     data?: Product;
//     error?: string;
// }> {
//     try {
//         const supabase = await createSupabaseServerClient();

//         const { data, error: supabaseError } = await supabase
//             .from('products')
//             .insert([
//                 {
//                     code: product.code || null,
//                     name: product.name,
//                     unit: product.unit,
//                     price: product.price,
//                     quantity: product.quantity,
//                 },
//             ])
//             .select(); // 🔥 Получить добавленную строку

//         if (supabaseError) {
//             console.error('Ошибка Supabase:', supabaseError);
//             return { success: false, error: supabaseError.message };
//         }

//         // Сохраняем также локально
//         await prisma.product.create({
//             data: {
//                 code: product.code || null,
//                 name: product.name,
//                 unit: product.unit,
//                 price: product.price,
//                 quantity: product.quantity,
//             },
//         });

//         return { success: true, data: data?.[0] }; // 👈 Возвращаем добавленный товар
//     } catch (error) {
//         console.error('Ошибка сохранения:', error);
//         return { success: false, error: (error as Error).message };
//     }
// }
