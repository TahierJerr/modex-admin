import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";
import { handleProductRemoval } from "@/lib/functions/handleProductRemoval";
import { handleProductModification } from "@/lib/functions/handleProductModification";

export async function GET (
    req: Request,
    { params }: { params: { motherboardId: string}}
) {
    try {
        if (!params.motherboardId) {
            return new NextResponse("Motherboard ID is required", { status: 400 });
        }

        const motherboard = await prismadb.motherboard.findUnique({
            where: {
                id: params.motherboardId,
            }
        });

        return NextResponse.json(motherboard);

    } catch (error) {
        console.log('[MOTHERBOARD_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

const motherboardSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Motherboard model is required" }),
    formFactor: z.string().min(1, { message: "Motherboard form factor is required" }),
    wifi: z.string().min(1, { message: "Motherboard wifi is required" }),
});

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, motherboardId: string}}
) {
    try {
        const updatedMotherboard = await handleProductModification(req, { storeId: params.storeId, productId: params.motherboardId }, motherboardSchema, "MOTHERBOARD", prismadb.motherboard, (data) => data);

        return NextResponse.json(updatedMotherboard);

    } catch (error) {
        console.log('[MOTHERBOARD_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, motherboardId: string}}
) {
    try {
        const motherboard = await handleProductRemoval(req, { storeId: params.storeId, productId: params.motherboardId }, "MOTHERBOARD", prismadb.motherboard);

        return NextResponse.json(motherboard);

    } catch (error) {
        console.log('[MOTHERBOARD_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};