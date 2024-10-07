import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";
import { handleProductRemoval } from "@/lib/functions/handleProductRemoval";
import { handleProductModification } from "@/lib/functions/handleProductModification";

export async function GET (
    req: Request,
    { params }: { params: { warrantyId: string}}
) {
    try {
        if (!params.warrantyId) {
            return new NextResponse("Warranty ID is required", { status: 400 });
        }

        const warranty = await prismadb.warranty.findUnique({
            where: {
                id: params.warrantyId,
            }
        });

        return NextResponse.json(warranty);

    } catch (error) {
        console.log('[WARRANTY_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

const warrantySchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
});

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, warrantyId: string}}
) {
    try {
        const updatedWarranty = await handleProductModification(req, { storeId: params.storeId, productId: params.warrantyId }, warrantySchema, "WARRANTY", prismadb.warranty, (data) => data);

        return NextResponse.json(updatedWarranty);

    } catch (error) {
        console.log('[WARRANTY_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, warrantyId: string}}
) {
    try {
        const warranty = await handleProductRemoval(req, { storeId: params.storeId, productId: params.warrantyId }, "WARRANTY", prismadb.warranty, "warrantyId");


        return NextResponse.json(warranty);

    } catch (error) {
        console.log('[WARRANTY_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};