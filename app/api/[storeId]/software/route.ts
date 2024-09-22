import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from 'zod';
import { handleProductCreation } from '@/lib/functions/handleProductCreation';

const softwareSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
});

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const software = await handleProductCreation(req, { storeId: params.storeId }, softwareSchema, "SOFTWARE", prismadb.software, (data) => data);

        return NextResponse.json(software);
    } catch (error) {
        console.log('[SOFTWARE_POST]', error);
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

        const software = await prismadb.software.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(software);
    } catch (error) {
        console.log('[SOFTWARE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};