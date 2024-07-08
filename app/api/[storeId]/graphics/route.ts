import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { z } from 'zod';
import prismadb from '@/lib/prismadb';

const graphicsSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    brand: z.string().min(1, { message: "Brand is required" }),
    model: z.string().min(1, { message: "GPU model is required" }),
    memory: z.string().min(1, { message: "GPU memory is required" }),
    memoryType: z.string().min(1, { message: "GPU memory type is required" }),
    maxClock: z.string().min(1, { message: "GPU max clock is required" }),
});

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const body = await req.json();

        const validation = graphicsSchema.safeParse(body);

        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 });
        }

        const { name, brand, model, memory, memoryType, maxClock } = validation.data;

        const storeByUserId = await prismadb.store.findFirst({
            where : {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const graphics = await prismadb.graphics.create({
            data: {
                name,
                brand,
                model,
                memory,
                memoryType,
                maxClock,
                storeId: params.storeId
            }
        });

        return NextResponse.json(graphics);
    } catch (error) {
        console.log('[GRAPHICS_POST]', error);
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

        const graphics = await prismadb.graphics.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(graphics);
    } catch (error) {
        console.log('[GRAPHICS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};