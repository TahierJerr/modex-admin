import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";

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

        return NextResponse.json(cooler);

    } catch (error) {
        console.log('[COOLER_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

const coolerSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Cooler model is required" }),
    type: z.string().min(1, { message: "Cooler type is required" }),
    fanModel: z.string().min(1, { message: "Cooler fan model is required" }),
    rgb: z.string().min(1, { message: "Cooler RGB is required" }),
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

        const cooler = await prismadb.cooler.updateMany({
            where: {
                id: params.coolerId,
            },
            data: {
                name,
                model,
                type,
                fanModel,
                rgb
            }
        })

        return NextResponse.json(cooler);

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

        return NextResponse.json(cooler);

    } catch (error) {
        console.log('[COOLER_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};