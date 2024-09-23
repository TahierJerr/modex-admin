import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";
import { handleProductRemoval } from "@/lib/functions/handleProductRemoval";
import { handleProductModification } from "@/lib/functions/handleProductModification";

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
        const updatedStorage = await handleProductModification(req, { storeId: params.storeId, productId: params.storageId }, storageSchema, "STORAGE", prismadb.storage, (data) => data);

        return NextResponse.json(updatedStorage);

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
        const storage = await handleProductRemoval(req, { storeId: params.storeId, productId: params.storageId }, "STORAGE", prismadb.storage);

        return NextResponse.json(storage);

    } catch (error) {
        console.log('[STORAGE_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};