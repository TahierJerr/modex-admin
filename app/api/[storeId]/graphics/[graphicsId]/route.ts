import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";
import { handleProductRemoval } from "@/lib/functions/handleProductRemoval";
import { handleProductModification } from "@/lib/functions/handleProductModification";
import { handleProductRetrieval } from '@/lib/functions/handleProductRetrieval';

export async function GET(
    req: Request,
    { params }: { params: { graphicsId: string } }
) {
    try {
        if (!params.graphicsId) {
            return new NextResponse("Graphics ID is required", { status: 400 });
        }

        const graphic = await handleProductRetrieval(params.graphicsId, prismadb.graphics);

        return NextResponse.json(graphic);
    } catch (error) {
        console.log('[GRAPHICS_UNIQUE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};


const graphicsSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    brand: z.string().min(1, { message: "Brand is required" }),
    model: z.string().min(1, { message: "GPU model is required" }),
    memory: z.string().min(1, { message: "GPU memory is required" }),
    memoryType: z.string().min(1, { message: "GPU memory type is required" }),
    maxClock: z.string().min(1, { message: "GPU max clock is required" }),
    priceTrackUrl: z.string().url().optional()
});

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string; graphicsId: string } }
) {
    try {
        const updatedGraphics = await handleProductModification(req, { storeId: params.storeId, productId: params.graphicsId }, graphicsSchema, "GRAPHICS", prismadb.graphics, (data) => data);

        return NextResponse.json(updatedGraphics);
    } catch (error) {
        console.log('[GRAPHICS_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};




export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, graphicsId: string}}
) {
    try {
        const graphics = await handleProductRemoval(req, { storeId: params.storeId, productId: params.graphicsId }, "GRAPHICS",prismadb.graphics);

        return NextResponse.json(graphics);

    } catch (error) {
        console.log('[GRAPHICS_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};