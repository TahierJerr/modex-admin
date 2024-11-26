import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prismadb from '@/lib/prismadb';
import { z } from 'zod';

const computerSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    price: z.number().min(1, { message: "Price is required" }),
    categoryId: z.string().min(1, { message: "Category is required" }),
    processorId: z.string().min(1, { message: "Processor is required" }),
    memoryId: z.string().min(1, { message: "Memory is required" }),
    graphicsId: z.string().min(1, { message: "Graphics card is required" }),
    motherboardId: z.string().min(1, { message: "Motherboard is required" }),
    storageId: z.string().min(1, { message: "Storage is required" }),
    pccaseId: z.string().min(1, { message: "PC Case is required" }),
    coolerId: z.string().min(1, { message: "CPU Cooler is required" }),
    powerId: z.string().min(1, { message: "PSU is required" }),
    colorId: z.string().min(1, { message: "Color is required" }),
    softwareId: z.string().min(1, { message: "Software is required" }),
    warrantyId: z.string().min(1, { message: "Warranty is required" }),
    images: z.array(z.object({ url: z.string().min(1) })).min(1, { message: "Images are required" }),
    isFeatured: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    isCustom: z.boolean().optional(),
    computerUserId: z.string().optional(),
    deliveryTime: z.string().min(1, { message: "Delivery days is required" }),
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

        const body = await req.json();

        const validation = computerSchema.safeParse(body);

        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 });
        }

        const { name, price, categoryId, processorId, memoryId, graphicsId, motherboardId, storageId, pccaseId, coolerId, powerId, colorId, softwareId, warrantyId, images, isFeatured, isArchived, deliveryTime, isCustom, computerUserId } = validation.data;
        
        const storeByUserId = await prismadb.store.findFirst({
            where : {
                id: params.storeId,
                userId
            }
        });

        const computerUser = await prismadb.user.findUnique({
            where: {
                id: computerUserId
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
                isCustom,
                userId: computerUserId,
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
        const coolerId = searchParams.get('coolerId') || undefined;
        const graphicsId = searchParams.get('graphicsId') || undefined;
        const pccaseId = searchParams.get('pccaseId') || undefined;
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
                coolerId,
                pccaseId,
                deliveryTime,
                isFeatured: isFeatured ? true : undefined,
                isArchived: false
            },
            include: {
                images: true,
                category: true,
                processor: true,
                memory: true,
                cooler: true,
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