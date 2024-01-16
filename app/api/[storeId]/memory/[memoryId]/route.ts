import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET (
    req: Request,
    { params }: { params: { memoryId: string}}
) {
    try {
        if (!params.memoryId) {
            return new NextResponse("Memory ID is required", { status: 400 });
        }

        const memory = await prismadb.memory.findUnique({
            where: {
                id: params.memoryId,
            }
        });

        return NextResponse.json(memory);

    } catch (error) {
        console.log('[MEMORY_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, memoryId: string}}
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

        if (!params.memoryId) {
            return new NextResponse("Memory ID is required", { status: 400 });
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

        const memory = await prismadb.memory.updateMany({
            where: {
                id: params.memoryId,
            },
            data: {
                name,
                model,
                type,
                speed,
                capacity,
                rgb,
            
            }
        })

        return NextResponse.json(memory);

    } catch (error) {
        console.log('[MEMORY_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, memoryId: string}}
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }


        if (!params.memoryId) {
            return new NextResponse("Memory ID is required", { status: 400 });
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

        const memory = await prismadb.memory.deleteMany({
            where: {
                id: params.memoryId,
            }
        });

        return NextResponse.json(memory);

    } catch (error) {
        console.log('[MEMORY_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};