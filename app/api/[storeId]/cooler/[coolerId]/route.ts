import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";
import { handleProductRemoval } from "@/lib/functions/handleProductRemoval";
import { handleProductModification } from "@/lib/functions/handleProductModification";
import { handleProductRetrieval } from '@/lib/functions/handleProductRetrieval';

export async function GET (
    req: Request,
    { params }: { params: { coolerId: string}}
) {
    try {
        if (!params.coolerId) {
            return new NextResponse("Cooler ID is required", { status: 400 });
        }

        const cooler = await handleProductRetrieval(prismadb.cooler, params.coolerId);

        return NextResponse.json(cooler);
    } catch (error) {
        console.log('[COOLER_UNIQUE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

const coolerSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Cooler model is required" }),
    type: z.string().min(1, { message: "Cooler type is required" }),
    fanModel: z.string().min(1, { message: "Cooler fan model is required" }),
    rgb: z.string().min(1, { message: "Cooler RGB is required" }),
    priceTrackUrl: z.string().url().optional()
});

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, coolerId: string}}
) {
    try {
        const updatedCooler = await handleProductModification(req, { storeId: params.storeId, productId: params.coolerId }, coolerSchema, "COOLER", prismadb.cooler, (data) => data);

        return NextResponse.json(updatedCooler);

    } catch (error) {
        console.log('[COOLER_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, coolerId: string}}
) {
    try {
        const cooler = await handleProductRemoval(req, { storeId: params.storeId, productId: params.coolerId }, "COOLER", prismadb.cooler);

        return NextResponse.json(cooler);

    } catch (error) {
        console.log('[COOLER_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};