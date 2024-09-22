import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from 'zod';
import { handleProductCreation } from '@/lib/functions/handleProductCreation';

const warrantySchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
});

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const warranty = await handleProductCreation(req, { storeId: params.storeId }, warrantySchema, "WARRANTY", prismadb.warranty, (data) => data);

        return NextResponse.json(warranty);
    } catch (error) {
        console.log('[WARRANTY_POST]', error);
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

        const warranty = await prismadb.warranty.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(warranty);
    } catch (error) {
        console.log('[WARRANTY_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};