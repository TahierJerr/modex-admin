import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from 'zod';
import { handleProductCreation } from '@/lib/functions/handleProductCreation';

const motherboardSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Motherboard model is required" }),
    formFactor: z.string().min(1, { message: "Motherboard form factor is required" }),
    wifi: z.string().min(1, { message: "Motherboard wifi is required" }),
});

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const motherboard = await handleProductCreation(req, { storeId: params.storeId }, motherboardSchema, "MOTHERBOARD", prismadb.motherboard, (data) => data);

        return NextResponse.json(motherboard);
    } catch (error) {
        console.log('[MOTHERBOARD_POST]', error);
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

        const motherboard = await prismadb.motherboard.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(motherboard);
    } catch (error) {
        console.log('MOTHERBOARD_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};