import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";
import { fetchPriceFromUrl } from "@/lib/scraping/fetchPriceFromUrl";
import isToday from "@/lib/utils/istoday";
import PriceData from "@/types";
import { handleProductRemoval } from "@/lib/functions/handleProductRemoval";
import { handleProductModification } from "@/lib/functions/handleProductModification";

export async function GET (
    req: Request,
    { params }: { params: { memoryId: string } }
) {
    try {
        if (!params.memoryId) {
            return new NextResponse("Memory ID is required", { status: 400 });
        }

        const memory = await prismadb.memory.findUnique({
            where: {
                id: params.memoryId,
            }
        });

        if (!memory) {
            return new NextResponse("Memory not found", { status: 404 });
        }

        if (!memory.priceTrackUrl) {
            return NextResponse.json(memory);
        }

        if (!isToday(memory.updatedAt)) {
            try {
                const response = await fetchPriceFromUrl(memory.priceTrackUrl);
                const priceData: PriceData = await response.json();

                const newPrice = priceData.minPriceNumber;

                if (newPrice === memory.price) {
                    return NextResponse.json(memory);
                }

                const updatedMemory = await prismadb.memory.update({
                    where: {
                        id: memory.id,
                    },
                    data: {
                        price: newPrice,
                    },
                });

                return NextResponse.json(updatedMemory);
            } catch (error) {
                console.error("[PRICE_FETCH_ERROR]", error);
                return new NextResponse("Failed to update price", { status: 500 });
            }
        }

        return NextResponse.json(memory);

    } catch (error) {
        console.log('[MEMORY_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

const memorySchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Memory model is required" }),
    type: z.string().min(1, { message: "Memory type is required" }),
    speed: z.string().min(1, { message: "Memory speed is required" }),
    capacity: z.string().min(1, { message: "Memory capacity is required" }),
    rgb: z.string().min(1, { message: "Memory RGB is required" }),
    priceTrackUrl: z.string().url().optional()
});

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string, memoryId: string } }
) {
    try {
        const updatedMemory = handleProductModification(req, { storeId: params.storeId, productId: params.memoryId }, memorySchema, "MEMORY", prismadb.memory, (data) => data);

        return NextResponse.json(updatedMemory);

    } catch (error) {
        console.log('[MEMORY_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, memoryId: string}}
) {
    try {

        const memory = await handleProductRemoval(req, { storeId: params.storeId, productId: params.memoryId }, "MEMORY",prismadb.memory);

        return NextResponse.json(memory);

    } catch (error) {
        console.log('[MEMORY_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};