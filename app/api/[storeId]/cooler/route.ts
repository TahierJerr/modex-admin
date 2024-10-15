import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from 'zod';
import { handleProductCreation } from '@/lib/functions/handleProductCreation';
import { handleProductRetrieval } from '@/lib/functions/handleProductRetrieval';

export const maxDuration = 30;

const coolerSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Cooler model is required" }),
    type: z.string().min(1, { message: "Cooler type is required" }),
    fanModel: z.string().min(1, { message: "Cooler fan model is required" }),
    rgb: z.string().min(1, { message: "Cooler RGB is required" }),
    priceTrackUrl: z.string().url().optional()
});

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const cooler = await handleProductCreation(req, { storeId: params.storeId }, coolerSchema, "COOLER", prismadb.cooler, (data) => data);

        return NextResponse.json(cooler);
    } catch (error) {
        console.log('[COOLER_POST]', error);
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

        const cooler = await handleProductRetrieval(prismadb.cooler)

        return NextResponse.json(cooler);
    } catch (error) {
        console.log('[COOLER_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};