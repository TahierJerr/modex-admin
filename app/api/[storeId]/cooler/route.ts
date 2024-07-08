import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prismadb from '@/lib/prismadb';
import { z } from 'zod';

const coolerSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Cooler model is required" }),
    type: z.string().min(1, { message: "Cooler type is required" }),
    fanModel: z.string().min(1, { message: "Cooler fan model is required" }),
    rgb: z.string().min(1, { message: "Cooler RGB is required" }),
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

        const validation = coolerSchema.safeParse(body);

        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 });
        }

        const { name, model, type, fanModel, rgb } = validation.data;

        const storeByUserId = await prismadb.store.findFirst({
            where : {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const cooler = await prismadb.cooler.create({
            data: {
                name,
                model,
                type,
                fanModel,
                rgb,
                storeId: params.storeId
            }
        });

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

        return NextResponse.json(cooler);
    } catch (error) {
        console.log('[COOLER_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};