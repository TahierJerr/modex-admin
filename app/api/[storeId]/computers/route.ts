import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { name, price, categoryId, processorId, memoryId, graphicsId, motherboardId, storageId, pccaseId, coolerId, powerId, colorId, softwareId, warrantyId, images, isFeatured, isArchived, deliveryTime } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!price) {
            return new NextResponse("Price is required", { status: 400 });
        }

        if (!categoryId) {
            return new NextResponse("Category is required", { status: 400 });
        }

        if (!processorId) {
            return new NextResponse("Processor is required", { status: 400 });
        }

        if (!memoryId) {
            return new NextResponse("Memory is required", { status: 400 });
        }

        if (!graphicsId) {
            return new NextResponse("Graphics card is required", { status: 400 });
        }

        if (!motherboardId) {
            return new NextResponse("Motherboard is required", { status: 400 });
        }

        if (!storageId) {
            return new NextResponse("Storage is required", { status: 400 });
        }

        if (!pccaseId) {
            return new NextResponse("PC Case is required", { status: 400 });
        }

        if (!coolerId) {
            return new NextResponse("CPU Cooler is required", { status: 400 });
        }

        if (!powerId) {
            return new NextResponse("PSU is required", { status: 400 });
        }

        if (!colorId) {
            return new NextResponse("Color is required", { status: 400 });
        }

        if (!softwareId) {
            return new NextResponse("Software is required", { status: 400 });
        }

        if (!warrantyId) {
            return new NextResponse("Warranty is required", { status: 400 });
        }

        if (!images || !images.length) {
            return new NextResponse("Images are required", { status: 400 });
        }

        if (!deliveryTime) {
            return new NextResponse("Delivery days is required", { status: 400 });
        }

        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
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

        const computer = await prismadb.computer.create({
            data: {
                name,
                price,
                categoryId,
                processorId,
                memoryId,
                graphicsId,
                motherboardId,
                storageId,
                pccaseId,
                coolerId,
                powerId,
                colorId,
                softwareId,
                warrantyId,
                isFeatured,
                isArchived,
                deliveryTime,
                storeId: params.storeId,
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: { url: string }) => image)
                        ]
                    }
                }
            }
        });

        return NextResponse.json(computer);
    } catch (error) {
        console.log('[COMPUTERS_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function GET(
    req: Request,
    { params: { storeId } }: { params: { storeId: string } }
) {
    if (!storeId) {
        return new NextResponse("Store ID is required", { status: 400 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const searchKeys = ['categoryId', 'processorId', 'memoryId', 'graphicsId', 'pccaseId', 'isFeatured', 'deliveryTime'];
        const searchParamsObj: { [key: string]: string | null } = searchKeys.reduce((obj, key) => ({ ...obj, [key]: searchParams.get(key) }), {});

        const computers = await prismadb.computer.findMany({
            where: {
                storeId,
                isArchived: false,
                ...searchParamsObj,
                isFeatured: searchParamsObj.isFeatured ? true : undefined,
            },
            include: {
                images: true,
                category: true,
                processor: true,
                memory: true,
                graphics: true,
                pccase: true,
                power: true,
                motherboard: true,
                storage: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(computers);
    } catch (error) {
        console.log('[COMPUTERS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};
