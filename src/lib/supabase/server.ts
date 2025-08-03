import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { cookies } from 'next/headers';

export const createSupabaseServerClient = () => {
    return createServerComponentClient<Database>({
        cookies: () => Promise.resolve(cookies()),
    });
};
