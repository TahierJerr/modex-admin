import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { z } from 'zod';
import prismadb from '@/lib/prismadb';
import { fetchPriceFromUrl } from '@/functions/trackprice';
import isToday from '@/functions/istoday';

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
        
        const validation = graphicsSchema.safeParse(body);
        
        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 });
        }
        
        const { name, brand, model, memory, memoryType, maxClock, priceTrackUrl } = validation.data;
        
        let price = null;
        if (priceTrackUrl) {
            price = await fetchPriceFromUrl(priceTrackUrl);
        }
        
        const graphics = await prismadb.graphics.create({
            data: {
                name,
                brand,
                model,
                memory,
                memoryType,
                maxClock,
                price,
                storeId: params.storeId,
                priceTrackUrl,
            }
        });
        
        const productType = "GRAPHICS";
        
        if(price && priceTrackUrl) {
            await prismadb.priceTracking.create({
                data: {
                    productId: graphics.id,
                    price: price,
                    productType: productType,
                    priceTrackUrl: priceTrackUrl
                }
            });
        }
        
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
                    const price = await fetchPriceFromUrl(graphic.priceTrackUrl);
                    
                    if (price !== graphic.price) {
                        await prismadb.graphics.update({
                            where: {
                                id: graphic.id
                            },
                            data: {
                                price
                            }
                        });
                        
                        await prismadb.priceTracking.create({
                            data: {
                                productId: graphic.id,
                                price,
                                productType: "GRAPHICS",
                                priceTrackUrl: graphic.priceTrackUrl
                            }
                        });
                        
                        return {
                            ...graphic,
                            price
                        };
                    }
                } catch (error) {
                    console.error(`[PRICE_FETCH_ERROR] ${error}`);
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

