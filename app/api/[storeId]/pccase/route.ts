import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from 'zod';
import { handleProductCreation } from '@/lib/functions/handleProductCreation';
import { handleProductRetrieval } from '@/lib/functions/handleProductRetrieval';

const pccaseSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Case model is required" }),
    color: z.string().min(1, { message: "Case color is required" }),
    motherboardSupport: z.string().min(1, { message: "Case motherboard support is required" }),
    ports: z.string().min(1, { message: "Case ports are required" }),
    priceTrackUrl: z.string().url().optional()
});

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const pccase = await handleProductCreation(req, { storeId: params.storeId }, pccaseSchema, "PCCASE", prismadb.pccase, (data) => data);

        return NextResponse.json(pccase);
    } catch (error) {
        console.log('[PCCASE_POST]', error);
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

        const pccase = await handleProductRetrieval(prismadb.pccase)

        return NextResponse.json(pccase);
    } catch (error) {
        console.log('PCCASE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};