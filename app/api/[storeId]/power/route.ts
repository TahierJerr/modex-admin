import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from 'zod';
import { handleProductCreation } from '@/lib/functions/handleProductCreation';
import { handleProductRetrieval } from '@/lib/functions/handleProductRetrieval';

export const maxDuration = 30;

const powerSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "PSU model is required" }),
    wattage: z.string().min(1, { message: "PSU wattage is required" }),
    rating: z.string().min(1, { message: "PSU rating is required" }),
    priceTrackUrl: z.string().url().optional()
});

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const power = await handleProductCreation(req, { storeId: params.storeId }, powerSchema, "POWER", prismadb.power, (data) => data);

        return NextResponse.json(power);
    } catch (error) {
        console.log('[POWER_POST]', error);
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

        const power = await handleProductRetrieval(prismadb.power)

        return NextResponse.json(power);
    } catch (error) {
        console.log('POWER_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};