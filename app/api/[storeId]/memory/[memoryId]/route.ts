import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";
import { fetchPriceFromUrl } from "@/functions/trackprice";
import isToday from "@/functions/istoday";

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
                const newPrice = await fetchPriceFromUrl(memory.priceTrackUrl);

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

                await prismadb.priceTracking.create({
                    data: {
                        productId: memory.id,
                        price: newPrice,
                        productType: "MEMORY",
                        priceTrackUrl: memory.priceTrackUrl
                    }
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
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!params.memoryId) {
            return new NextResponse("Memory ID is required", { status: 400 });
        }

        const body = await req.json();

        const validation = memorySchema.safeParse(body);

        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 });
        }

        const { name, model, type, speed, capacity, rgb, priceTrackUrl } = validation.data;

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const existingMemory = await prismadb.memory.findUnique({
            where: {
                id: params.memoryId,
            }
        });

        if (!existingMemory) {
            return new NextResponse("Memory not found", { status: 404 });
        }

        let updatedData: any = { name, model, type, speed, capacity, rgb };

        if (priceTrackUrl && priceTrackUrl !== existingMemory.priceTrackUrl) {
            const newPrice = await fetchPriceFromUrl(priceTrackUrl);
            
            updatedData.price = newPrice;
            updatedData.priceTrackUrl = priceTrackUrl;
        } else {
            updatedData.priceTrackUrl = existingMemory.priceTrackUrl;
        }

        const updatedMemory = await prismadb.memory.update({
            where: {
                id: params.memoryId,
            },
            data: updatedData
        });

        if (updatedData.price !== existingMemory.price) {
            await prismadb.priceTracking.create({
                data: {
                    productId: updatedMemory.id,
                    price: updatedData.price,
                    productType: "MEMORY",
                    priceTrackUrl: updatedData.priceTrackUrl
                }
            });
        }

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
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }


        if (!params.memoryId) {
            return new NextResponse("Memory ID is required", { status: 400 });
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

        const memory = await prismadb.memory.deleteMany({
            where: {
                id: params.memoryId,
            }
        });

        await prismadb.priceTracking.deleteMany({
            where: {
                productId: params.memoryId,
                productType: "MEMORY"
            }
        });

        return NextResponse.json(memory);

    } catch (error) {
        console.log('[MEMORY_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};