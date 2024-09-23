import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from 'zod';
import { handleProductCreation } from '@/lib/functions/handleProductCreation';

const colorSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    value: z.string().min(1, { message: "Value is required" }),
});

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const color = await handleProductCreation(req, { storeId: params.storeId }, colorSchema, "COLOR", prismadb.color, (data) => data);


        return NextResponse.json(color);
    } catch (error) {
        console.log('[COLOR_POST]', error);
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

        const color = await prismadb.color.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(color);
    } catch (error) {
        console.log('[COLOR_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};