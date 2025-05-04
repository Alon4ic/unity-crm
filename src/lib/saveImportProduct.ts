'use server';

import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

export async function saveImportProduct(product: {
  name: string;
  code?: string;
  unit: string;
  price: number;
  quantity: number;
}) {
  try {
    const id = uuidv4();

    const newProduct = await prisma.product.create({
      data: {
        id,
        name: product.name,
        code: product.code || null,
        unit: product.unit,
        price: product.price,
        quantity: product.quantity,
        synced: false, // <- опционально для трекинга
      },
    });

    return { success: true, id: newProduct.id };
  } catch (error) {
    console.error('Ошибка при сохранении товара:', error);
    return { success: false, error };
  }
}
