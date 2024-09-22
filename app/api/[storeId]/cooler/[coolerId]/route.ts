import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";
import { fetchPriceFromUrl } from "@/lib/scraping/fetchPriceFromUrl";
import isToday from "@/lib/utils/istoday";

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
                const newPrice = await fetchPriceFromUrl(cooler.priceTrackUrl);

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

                await prismadb.priceTracking.create({
                    data: {
                        productId: cooler.id,
                        price: newPrice,
                        productType: "COOLER",
                        priceTrackUrl: cooler.priceTrackUrl
                    }
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
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!params.coolerId) {
            return new NextResponse("Cooler ID is required", { status: 400 });
        }

        const body = await req.json();

        const validation = coolerSchema.safeParse(body);

        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 });
        }

        const { name, model, type, fanModel, rgb, priceTrackUrl } = validation.data;

        const storeByUserId = await prismadb.store.findFirst({
            where : {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const existingCooler = await prismadb.cooler.findUnique({
            where: {
                id: params.coolerId
            }
        });

        if (!existingCooler) {
            return new NextResponse("Cooler not found", { status: 404 });
        }

        let updatedData: any = { name, model, type, fanModel, rgb, priceTrackUrl };

        if (priceTrackUrl && !existingCooler?.priceTrackUrl) {
            const newPrice = await fetchPriceFromUrl(priceTrackUrl);

            updatedData.price = newPrice;
            updatedData.priceTrackUrl = priceTrackUrl;
        } else {
            updatedData.price = existingCooler.price;
            updatedData.priceTrackUrl = existingCooler.priceTrackUrl;
        }

        const updatedCooler = await prismadb.cooler.update({
            where: {
                id: params.coolerId,
            },
            data: updatedData
        });

        if (updatedData.price !== existingCooler.price) {
            await prismadb.priceTracking.create({
                data: {
                    productId: updatedCooler.id,
                    price: updatedData.price,
                    productType: "COOLER",
                    priceTrackUrl: updatedData.priceTrackUrl
                }
            })
        }

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
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }


        if (!params.coolerId) {
            return new NextResponse("Cooler ID is required", { status: 400 });
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

        const cooler = await prismadb.cooler.deleteMany({
            where: {
                id: params.coolerId,
            }
        });

        await prismadb.priceTracking.deleteMany({
            where: {
                productId: params.coolerId,
                productType: "COOLER"
            }
        });

        return NextResponse.json(cooler);

    } catch (error) {
        console.log('[COOLER_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};