import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";

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

const memorySchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Memory model is required" }),
    type: z.string().min(1, { message: "Memory type is required" }),
    speed: z.string().min(1, { message: "Memory speed is required" }),
    capacity: z.string().min(1, { message: "Memory capacity is required" }),
    rgb: z.string().min(1, { message: "Memory RGB is required" }),
});

export async function PATCH (
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

        const body = await req.json();

        const validation = memorySchema.safeParse(body);

        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 });
        }

        const { name, model, type, speed, capacity, rgb } = validation.data;

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