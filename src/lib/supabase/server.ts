// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
    const cookieStore = await cookies(); // Добавляем await

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name) => cookieStore.get(name)?.value,
                // Реализуем остальные методы для SSR
                set: (name, value, options) => {
                    cookieStore.set({
                        name,
                        value,
                        ...options,
                        httpOnly: true,
                        sameSite: 'lax',
                    });
                },
                remove: (name, options) => {
                    cookieStore.set({
                        name,
                        value: '',
                        ...options,
                        maxAge: 0,
                    });
                },
            },
        }
    );
}
