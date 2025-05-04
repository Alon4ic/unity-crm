import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim() === '') {
        return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
        where: {
            OR: [
                {
                    name: {
                        contains: query,
                        mode: 'insensitive',
                    } as Prisma.StringFilter<string>,
                },
                {
                    code: {
                        contains: query,
                        mode: 'insensitive',
                    } as Prisma.StringFilter<string>,
                },
            ],
        },
        take: 10,
        orderBy: {
            name: 'asc',
        },
    });

    return NextResponse.json(products);
}
