import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";
import { handleProductRemoval } from "@/lib/functions/handleProductRemoval";
import { handleProductModification } from "@/lib/functions/handleProductModification";
import { handleProductRetrieval } from "@/lib/functions/handleProductRetrieval";

export async function GET (
    req: Request,
    { params }: { params: { pccaseId: string}}
) {
    try {
        if (!params.pccaseId) {
            return new NextResponse("Case ID is required", { status: 400 });
        }

        const pccase = await handleProductRetrieval(prismadb.pccase, params.pccaseId);


        return NextResponse.json(pccase);

    } catch (error) {
        console.log('[PCCASE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

const pccaseSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Case model is required" }),
    color: z.string().min(1, { message: "Case color is required" }),
    motherboardSupport: z.string().min(1, { message: "Case motherboard support is required" }),
    ports: z.string().min(1, { message: "Case ports are required" }),
    priceTrackUrl: z.string().url().optional()
});

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, pccaseId: string}}
) {
    try {
        const updatedPccase = await handleProductModification(req, { storeId: params.storeId, productId: params.pccaseId }, pccaseSchema, "PCCASE", prismadb.pccase, (data) => data);

        return NextResponse.json(updatedPccase);

    } catch (error) {
        console.log('[PCCASE_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, pccaseId: string}}
) {
    try {
        const pccase = await handleProductRemoval(req, { storeId: params.storeId, productId: params.pccaseId }, "PCCASE", prismadb.pccase);


        return NextResponse.json(pccase);

    } catch (error) {
        console.log('[PCCASE_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};