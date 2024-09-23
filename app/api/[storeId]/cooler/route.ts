import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from 'zod';
import { fetchPriceFromUrl } from '@/lib/scraping/fetchPriceFromUrl';
import isToday from '@/lib/utils/istoday';
import { handleProductCreation } from '@/lib/functions/handleProductCreation';
import PriceData from '@/types';

const coolerSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Cooler model is required" }),
    type: z.string().min(1, { message: "Cooler type is required" }),
    fanModel: z.string().min(1, { message: "Cooler fan model is required" }),
    rgb: z.string().min(1, { message: "Cooler RGB is required" }),
    priceTrackUrl: z.string().url().optional()
});

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const cooler = await handleProductCreation(req, { storeId: params.storeId }, coolerSchema, "COOLER", prismadb.cooler, (data) => data);

        return NextResponse.json(cooler);
    } catch (error) {
        console.log('[COOLER_POST]', error);
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

        const cooler = await prismadb.cooler.findMany({
            where: {
                storeId: params.storeId
            }
        });

        const updatedCooler = await Promise.all(cooler.map(async (cooler) => {
            if (!cooler.priceTrackUrl) {
                return cooler;
            }

            if (!isToday(cooler.updatedAt)) {
                try {
                    const priceData = await fetchPriceFromUrl(cooler.priceTrackUrl);
                    const price = priceData.minPriceNumber;

                    if (price !== cooler.price) {
                        await prismadb.cooler.update({
                            where: {
                                id: cooler.id
                            },
                            data: {
                                price
                            }
                        });

                        return {
                            ...cooler,
                            price
                        }
                    }
                } catch (error) {
                    console.log('[PRICE_FETCH_ERROR_COOLER]', error);
                }
            }

            return cooler;
        }));

        return NextResponse.json(updatedCooler);
    } catch (error) {
        console.log('[COOLER_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};