import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from 'zod';
import { handleProductCreation } from '@/lib/functions/handleProductCreation';

const storageSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Storage model is required" }),
    type: z.string().min(1, { message: "Storage type is required" }),
    capacity: z.string().min(1, { message: "Storage capacity is required" }),
});

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const storage = await handleProductCreation(req, { storeId: params.storeId }, storageSchema, "STORAGE", prismadb.storage, (data) => data);

        return NextResponse.json(storage);
    } catch (error) {
        console.log('[STORAGE_POST]', error);
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

        const storage = await prismadb.storage.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(storage);
    } catch (error) {
        console.log('STORAGE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};