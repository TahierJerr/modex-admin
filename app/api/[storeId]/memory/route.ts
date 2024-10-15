import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from 'zod';
import { handleProductCreation } from '@/lib/functions/handleProductCreation';
import { handleProductRetrieval } from '@/lib/functions/handleProductRetrieval';

export const maxDuration = 30;

const memorySchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Memory model is required" }),
    type: z.string().min(1, { message: "Memory type is required" }),
    speed: z.string().min(1, { message: "Memory speed is required" }),
    capacity: z.string().min(1, { message: "Memory capacity is required" }),
    rgb: z.string().min(1, { message: "Memory RGB is required" }),
    priceTrackUrl: z.string().url().optional()
});

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const memory = await handleProductCreation(req, { storeId: params.storeId }, memorySchema, "MEMORY", prismadb.memory, (data) => data);

        return NextResponse.json(memory);
    } catch (error) {
        console.log('[MEMORY_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }
        
        const memory = await handleProductRetrieval(prismadb.memory)
        
        return NextResponse.json(memory);
    } catch (error) {
        console.log('[MEMORY_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};
