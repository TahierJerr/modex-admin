import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";
import { handleProductRemoval } from "@/lib/functions/handleProductRemoval";

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

export async function PATCH (
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

        const body = await req.json();

        const validation = computerSchema.safeParse(body);

        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 });
        }

        const { name, price, categoryId, processorId, memoryId, graphicsId, motherboardId, storageId, pccaseId, coolerId, powerId, colorId, softwareId, warrantyId, images, isFeatured, isArchived, deliveryTime, isCustom, computerUserId } = validation.data;

        const storeByUserId = await prismadb.store.findFirst({
            where : {
                id: params.storeId,
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const computerUser = await prismadb.user.findUnique({
            where: {
                id: computerUserId
            }
        });

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
                isCustom,
                userId: computerUserId
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

        const computer = await handleProductRemoval(req, { storeId: params.storeId, productId: params.computerId }, "COMPUTER", prismadb.computer);

        return NextResponse.json(computer);

    } catch (error) {
        console.log('[COMPUTER_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};
