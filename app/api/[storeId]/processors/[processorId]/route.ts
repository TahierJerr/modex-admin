import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";
import { handleProductRemoval } from "@/lib/functions/handleProductRemoval";
import { handleProductModification } from "@/lib/functions/handleProductModification";

export async function GET (
    req: Request,
    { params }: { params: { processorId: string}}
) {
    try {
        if (!params.processorId) {
            return new NextResponse("Processor ID is required", { status: 400 });
        }

        const processor = await prismadb.processor.findUnique({
            where: {
                id: params.processorId,
            }
        });

        return NextResponse.json(processor);

    } catch (error) {
        console.log('[PROCESSOR_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

const processorSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    brand: z.string().min(1, { message: "Brand is required" }),
    series: z.string().min(1, { message: "Processor series is required" }),
    baseSpeed: z.string().min(1, { message: "Processor base speed is required" }),
    cores: z.string().min(1, { message: "Processor cores is required" }),
});

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, processorId: string}}
) {
    try {
        const updatedProcessor = await handleProductModification(req, { storeId: params.storeId, productId: params.processorId }, processorSchema, "PROCESSOR", prismadb.processor, (data) => data);

        return NextResponse.json(updatedProcessor);

    } catch (error) {
        console.log('[PROCESSOR_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, processorId: string}}
) {
    try {
        const processor = await handleProductRemoval(req, { storeId: params.storeId, productId: params.processorId }, "PROCESSOR", prismadb.processor);


        return NextResponse.json(processor);

    } catch (error) {
        console.log('[PROCESSOR_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};