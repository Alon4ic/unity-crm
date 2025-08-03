// __mocks__/@/lib/supabase/client.ts
export const supabase = {
    from: () => ({
        select: () => ({
            order: () => ({
                order: () => ({
                    order: () => ({
                        data: [],
                        error: null,
                    }),
                }),
            }),
        }),
    }),
};
