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
        console.log(Date.now())
        const storeByUserId = await prismadb.store.findFirst({
            where : {
                id: params.storeId,
                userId
            }
        });
        console.log(Date.now())

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
    { params }: { params: { storeId: string } }
) {
    try {
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId') || undefined;
        const processorId = searchParams.get('processorId') || undefined;
        const memoryId = searchParams.get('memoryId') || undefined;
        const graphicsId = searchParams.get('graphicsId') || undefined;
        const motherboardId = searchParams.get('motherboardId') || undefined;
        const storageId = searchParams.get('storageId') || undefined;
        const pccaseId = searchParams.get('pccaseId') || undefined;
        const coolerId = searchParams.get('coolerId') || undefined;
        const powerId = searchParams.get('powerId') || undefined;
        const colorId = searchParams.get('colorId') || undefined;
        const softwareId = searchParams.get('softwareId') || undefined;
        const warrantyId = searchParams.get('warrantyId') || undefined;
        const isFeatured = searchParams.get('isFeatured');
        const deliveryTime = searchParams.get('deliveryTime') || undefined;

        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const computers = await prismadb.computer.findMany({
            where: {
                storeId: params.storeId,
                categoryId,
                processorId,
                memoryId,
                graphicsId,
                motherboardId,
                storageId,
                pccaseId,
                deliveryTime,
                coolerId,
                powerId,
                colorId,
                softwareId,
                warrantyId,
                isFeatured: isFeatured ? true : undefined,
                isArchived: false
            },
            include: {
                images: true,
                category: true,
                processor: true,
                memory: true,
                graphics: true,
                pccase: true,
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