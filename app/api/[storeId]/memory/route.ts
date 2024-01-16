import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { name, model, type, speed, capacity, rgb } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!model) {
            return new NextResponse("Memory model is required", { status: 400 });
        }

        if (!type) {
            return new NextResponse("Memory type is required", { status: 400 });
        }

        if (!speed) {
            return new NextResponse("Memory speed is required", { status: 400 });
        }

        if (!capacity) {
            return new NextResponse("Memory capacity is required", { status: 400 });
        }

        if (!rgb) {
            return new NextResponse("Memory RGB is required", { status: 400 });
        }

        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where : {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const memory = await prismadb.memory.create({
            data: {
                name,
                model,
                type,
                speed,
                capacity,
                rgb,
                storeId: params.storeId
            }
        });

        return NextResponse.json(memory);
    } catch (error) {
        console.log('[MEMORY_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function GET(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {

        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const memory = await prismadb.memory.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(memory);
    } catch (error) {
        console.log('[MEMORY_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};