import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from 'zod';
import { fetchPriceFromUrl } from '@/lib/scraping/fetchPriceFromUrl';
import isToday from "@/lib/utils/istoday";
import { handleProductCreation } from '@/lib/functions/handleProductCreation';
import PriceData from '@/types';

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
        const memory = await handleProductCreation(req, { storeId: params.storeId }, memorySchema, "MEMORY", prismadb.memory, (data) => data);

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
                    const response = await fetchPriceFromUrl(memory.priceTrackUrl);
                    const priceData: PriceData = await response.json();

                    const price = priceData.minPriceNumber;
                    
                    if (price !== memory.price) {
                        await prismadb.graphics.update({
                            where: {
                                id: memory.id
                            },
                            data: {
                                price
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
