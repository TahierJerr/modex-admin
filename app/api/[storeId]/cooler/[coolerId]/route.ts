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
    { params }: { params: { coolerId: string}}
) {
    try {
        if (!params.coolerId) {
            return new NextResponse("Cooler ID is required", { status: 400 });
        }

        const cooler = await prismadb.cooler.findUnique({
            where: {
                id: params.coolerId,
            }
        });

        if (!cooler) {
            return new NextResponse("Cooler not found", { status: 404 });
        }

        if (!cooler.priceTrackUrl) {
            return NextResponse.json(cooler);
        }

        if (!isToday(cooler.updatedAt)) {
            try {
                const priceData = await fetchPriceFromUrl(cooler.priceTrackUrl);
                const newPrice = priceData.minPriceNumber;

                if (newPrice === cooler.price) {
                    return NextResponse.json(cooler);
                }

                const updatedCooler = await prismadb.cooler.update({
                    where: {
                        id: cooler.id,
                    },
                    data: {
                        price: newPrice,
                    },
                });

                return NextResponse.json(updatedCooler);
            } catch (error) {
                console.error("[PRICE_FETCH_ERROR_COOLER]", error);
                return new NextResponse("Failed to update price", { status: 500 });
            }
        }

        return NextResponse.json(cooler);
    } catch (error) {
        console.log('[COOLER_UNIQUE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

const coolerSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Cooler model is required" }),
    type: z.string().min(1, { message: "Cooler type is required" }),
    fanModel: z.string().min(1, { message: "Cooler fan model is required" }),
    rgb: z.string().min(1, { message: "Cooler RGB is required" }),
    priceTrackUrl: z.string().url().optional()
});

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, coolerId: string}}
) {
    try {
        const updatedCooler = await handleProductModification(req, { storeId: params.storeId, productId: params.coolerId }, coolerSchema, "COOLER", prismadb.cooler, (data) => data);

        return NextResponse.json(updatedCooler);

    } catch (error) {
        console.log('[COOLER_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, coolerId: string}}
) {
    try {
        const cooler = await handleProductRemoval(req, { storeId: params.storeId, productId: params.coolerId }, "COOLER", prismadb.cooler);

        return NextResponse.json(cooler);

    } catch (error) {
        console.log('[COOLER_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};