import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from 'zod';
import { handleProductCreation } from '@/lib/functions/handleProductCreation';

const processorSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    brand: z.string().min(1, { message: "Brand is required" }),
    series: z.string().min(1, { message: "Processor series is required" }),
    baseSpeed: z.string().min(1, { message: "Processor base speed is required" }),
    cores: z.string().min(1, { message: "Processor cores is required" }),
});

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const processor = await handleProductCreation(req, { storeId: params.storeId }, processorSchema, "PROCESSOR", prismadb.processor, (data) => data, true);

        return NextResponse.json(processor);
    } catch (error) {
        console.log('[PROCESSORS_POST]', error);
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

        const processor = await prismadb.processor.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(processor);
    } catch (error) {
        console.log('[PROCESSORS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};