import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prismadb from '@/lib/prismadb';
import { z } from 'zod';
import { fetchPriceFromUrl } from '@/functions/trackprice';
import isToday from "@/functions/istoday";

const memorySchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Memory model is required" }),
    type: z.string().min(1, { message: "Memory type is required" }),
    speed: z.string().min(1, { message: "Memory speed is required" }),
    capacity: z.string().min(1, { message: "Memory capacity is required" }),
    rgb: z.string().min(1, { message: "Memory RGB is required" }),
    priceTrackUrl: z.string().url().optional()
});

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const body = await req.json();

        const validation = memorySchema.safeParse(body);

        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 });
        }

        const { name, model, type, speed, capacity, rgb, priceTrackUrl } = validation.data;

        let price = null;
        if (priceTrackUrl) {
            price = await fetchPriceFromUrl(priceTrackUrl);
        }

        const memory = await prismadb.memory.create({
            data: {
                name,
                model,
                type,
                speed,
                capacity,
                rgb,
                price,
                priceTrackUrl,
                storeId: params.storeId
            }
        });

        const productType = "MEMORY";

        if(price && priceTrackUrl) {
        await prismadb.priceTracking.create({
            data: {
                productId: memory.id,
                price: price,
                productType: productType,
                priceTrackUrl: priceTrackUrl,
            }
        });
    }

        return NextResponse.json(memory);
    } catch (error) {
        console.log('[MEMORY_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }
        
        const memory = await prismadb.memory.findMany({
            where: {
                storeId: params.storeId
            }
        });
        
        const updatedMemory = await Promise.all(memory.map(async (memory) => {
            if (!memory.priceTrackUrl) {
                return memory;
            }
            
            if (!isToday(memory.updatedAt)) {
                try {
                    const price = await fetchPriceFromUrl(memory.priceTrackUrl);
                    
                    if (price !== memory.price) {
                        await prismadb.graphics.update({
                            where: {
                                id: memory.id
                            },
                            data: {
                                price
                            }
                        });
                        
                        await prismadb.priceTracking.create({
                            data: {
                                productId: memory.id,
                                price,
                                productType: "MEMORY",
                                priceTrackUrl: memory.priceTrackUrl
                            }
                        });
                        
                        return {
                            ...memory,
                            price
                        };
                    }
                    
                } catch (error) {
                    console.error(`[PRICE_FETCH_ERROR] ${error}`);
                }
            }
            
            return memory;
        }));
        
        return NextResponse.json(updatedMemory);
    } catch (error) {
        console.log('[MEMORY_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};
