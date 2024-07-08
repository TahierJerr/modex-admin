import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prismadb from '@/lib/prismadb';
import { z } from 'zod';

const pccaseSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Case model is required" }),
    color: z.string().min(1, { message: "Case color is required" }),
    motherboardSupport: z.string().min(1, { message: "Case motherboard support is required" }),
    ports: z.string().min(1, { message: "Case ports are required" }),
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

        const validation = pccaseSchema.safeParse(body);

        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 });
        }

        const { name, model, color, motherboardSupport, ports } = validation.data;

        const storeByUserId = await prismadb.store.findFirst({
            where : {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const pccase = await prismadb.pccase.create({
            data: {
                name,
                model,
                color,
                motherboardSupport,
                ports,
                storeId: params.storeId
            }
        });

        return NextResponse.json(pccase);
    } catch (error) {
        console.log('[PCCASE_POST]', error);
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

        const pccase = await prismadb.pccase.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(pccase);
    } catch (error) {
        console.log('PCCASE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};