import { NextResponse } from 'next/server';
import { z } from 'zod';
import prismadb from '@/lib/prismadb';
import { fetchPriceFromUrl } from '@/lib/scraping/fetchPriceFromUrl';
import isToday from '@/lib/utils/istoday';
import { handleProductCreation } from '@/lib/functions/handleProductCreation';
import PriceData from '@/types';

const graphicsSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    brand: z.string().min(1, { message: "Brand is required" }),
    model: z.string().min(1, { message: "GPU model is required" }),
    memory: z.string().min(1, { message: "GPU memory is required" }),
    memoryType: z.string().min(1, { message: "GPU memory type is required" }),
    maxClock: z.string().min(1, { message: "GPU max clock is required" }),
    priceTrackUrl: z.string().url().optional()
});

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const graphics = await handleProductCreation(req, { storeId: params.storeId }, graphicsSchema, "GRAPHICS", prismadb.graphics, (data) => data);
        
        return NextResponse.json(graphics);
    } catch (error) {
        console.log('[GRAPHICS_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function GET(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }
        
        const graphics = await prismadb.graphics.findMany({
            where: {
                storeId: params.storeId
            }
        });
        
        const updatedGraphics = await Promise.all(graphics.map(async (graphic) => {
            if (!graphic.priceTrackUrl) {
                return graphic;
            }
            
            if (!isToday(graphic.updatedAt)) {
                try {
                    const priceData = await fetchPriceFromUrl(graphic.priceTrackUrl);
                    const price = priceData.minPriceNumber;
                    
                    if (price !== graphic.price) {
                        await prismadb.graphics.update({
                            where: {
                                id: graphic.id
                            },
                            data: {
                                price
                            }
                        });
                        
                        return {
                            ...graphic,
                            price
                        };
                    }
                } catch (error) {
                    console.error(`[PRICE_FETCH_ERROR_GRAPHICS] ${error}`);
                }
            }
            
            return graphic;
        }));
        
        return NextResponse.json(updatedGraphics);
    } catch (error) {
        console.log('[GRAPHICS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

