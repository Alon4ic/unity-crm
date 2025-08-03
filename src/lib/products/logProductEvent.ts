import { db } from '@/lib/dexie/productsDB';
import { supabase } from '@/lib/supabase/client';

type EventType = 'delivery' | 'return';

export async function logProductEvent({
    productId,
    type,
    quantity,
}: {
    productId: string;
    type: EventType;
    quantity: number;
}) {
    const event = {
        id: crypto.randomUUID(),
        product_id: productId,
        type,
        quantity,
        created_at: new Date().toISOString(),
    };

    try {
        // 1. Сохраняем в IndexedDB (Dexie)
        await db.product_events.add(event);

        // 2. Параллельно отправляем в Supabase (если есть интернет)
        const { error } = await supabase.from('product_events').insert(event);
        if (error) {
            console.warn('Ошибка при сохранении в Supabase:', error.message);
        }
    } catch (err) {
        console.error('Ошибка при сохранении события:', err);
    }
}
