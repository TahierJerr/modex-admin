import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prismadb from '@/lib/prismadb';
import { z } from 'zod';

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
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const body = await req.json();

        const validation = storageSchema.safeParse(body);
        
        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 });
        }

        const { name, model, type, capacity } = validation.data;

        const storeByUserId = await prismadb.store.findFirst({
            where : {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const storage = await prismadb.storage.create({
            data: {
                name,
                model,
                type,
                capacity,
                storeId: params.storeId
            }
        });

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