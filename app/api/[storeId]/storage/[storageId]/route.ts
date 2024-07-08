import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";

export async function GET (
    req: Request,
    { params }: { params: { storageId: string}}
) {
    try {
        if (!params.storageId) {
            return new NextResponse("Storage ID is required", { status: 400 });
        }

        const storage = await prismadb.storage.findUnique({
            where: {
                id: params.storageId,
            }
        });

        return NextResponse.json(storage);

    } catch (error) {
        console.log('[STORAGE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

const storageSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Storage model is required" }),
    type: z.string().min(1, { message: "Storage type is required" }),
    capacity: z.string().min(1, { message: "Storage capacity is required" }),
});

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, storageId: string}}
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!params.storageId) {
            return new NextResponse("Storage ID is required", { status: 400 });
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

        const storage = await prismadb.storage.updateMany({
            where: {
                id: params.storageId,
            },
            data: {
                name,
                model,
                type,
                capacity,
            
            }
        })

        return NextResponse.json(storage);

    } catch (error) {
        console.log('[STORAGE_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, storageId: string}}
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }


        if (!params.storageId) {
            return new NextResponse("Storage ID is required", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where : {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const storage = await prismadb.storage.deleteMany({
            where: {
                id: params.storageId,
            }
        });

        return NextResponse.json(storage);

    } catch (error) {
        console.log('[STORAGE_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};