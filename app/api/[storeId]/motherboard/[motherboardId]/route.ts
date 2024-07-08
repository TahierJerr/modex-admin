import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";

export async function GET (
    req: Request,
    { params }: { params: { motherboardId: string}}
) {
    try {
        if (!params.motherboardId) {
            return new NextResponse("Motherboard ID is required", { status: 400 });
        }

        const motherboard = await prismadb.motherboard.findUnique({
            where: {
                id: params.motherboardId,
            }
        });

        return NextResponse.json(motherboard);

    } catch (error) {
        console.log('[MOTHERBOARD_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

const motherboardSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Motherboard model is required" }),
    formFactor: z.string().min(1, { message: "Motherboard form factor is required" }),
    wifi: z.string().min(1, { message: "Motherboard wifi is required" }),
});

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, motherboardId: string}}
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!params.motherboardId) {
            return new NextResponse("Motherboard ID is required", { status: 400 });
        }

        const body = await req.json();

        const validation = motherboardSchema.safeParse(body);

        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 });
        }

        const { name, model, formFactor, wifi } = validation.data;

        const storeByUserId = await prismadb.store.findFirst({
            where : {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const motherboard = await prismadb.motherboard.updateMany({
            where: {
                id: params.motherboardId,
            },
            data: {
                name,
                model,
                formFactor,
                wifi,
            
            }
        })

        return NextResponse.json(motherboard);

    } catch (error) {
        console.log('[MOTHERBOARD_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, motherboardId: string}}
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }


        if (!params.motherboardId) {
            return new NextResponse("Motherboard ID is required", { status: 400 });
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

        const motherboard = await prismadb.motherboard.deleteMany({
            where: {
                id: params.motherboardId,
            }
        });

        return NextResponse.json(motherboard);

    } catch (error) {
        console.log('[MOTHERBOARD_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};