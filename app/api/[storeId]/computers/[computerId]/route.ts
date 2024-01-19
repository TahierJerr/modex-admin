import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET (
    req: Request,
    { params }: { params: { computerId: string}}
) {
    try {
        if (!params.computerId) {
            return new NextResponse("Computer ID is required", { status: 400 });
        }

        const computer = await prismadb.computer.findUnique({
            where: {
                id: params.computerId,
                isArchived: false
            },
            include: {
                images: true,
                category: true,
                processor: true,
                memory: true,
                graphics: true,
                motherboard: true,
                storage: true,
                pccase: true,
                cooler: true,
                power: true,
                color: true,
                software: true,
                warranty: true
            }
        });

        return NextResponse.json(computer);

    } catch (error) {
        console.log('[COMPUTER_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, computerId: string}}
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
            return new NextResponse("Delivery time is required", { status: 400 });
        }

        if (!params.computerId) {
            return new NextResponse("Computer ID is required", { status: 400 });
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

        await prismadb.computer.update({
            where: {
                id: params.computerId,
            },
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
                storeId: params.storeId,
                images: {
                    deleteMany: {}
                },
                deliveryTime,
                isFeatured,
                isArchived,
            }
        });

        const computer = await prismadb.computer.update({
            where: {
                id: params.computerId
            },
            data: {
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: { url: string }) => image),
                        ]
                    }
                }
            }
        
        })

        return NextResponse.json(computer);

    } catch (error) {
        console.log('[COMPUTER_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, computerId: string}}
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }


        if (!params.computerId) {
            return new NextResponse("Computer ID is required", { status: 400 });
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

        const computer = await prismadb.computer.deleteMany({
            where: {
                id: params.computerId,
            }
        });

        return NextResponse.json(computer);

    } catch (error) {
        console.log('[COMPUTER_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};