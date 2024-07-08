import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";

export async function GET (
    req: Request,
    { params }: { params: { pccaseId: string}}
) {
    try {
        if (!params.pccaseId) {
            return new NextResponse("Case ID is required", { status: 400 });
        }

        const pccase = await prismadb.pccase.findUnique({
            where: {
                id: params.pccaseId,
            }
        });

        return NextResponse.json(pccase);

    } catch (error) {
        console.log('[PCCASE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

const pccaseSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "Case model is required" }),
    color: z.string().min(1, { message: "Case color is required" }),
    motherboardSupport: z.string().min(1, { message: "Case motherboard support is required" }),
    ports: z.string().min(1, { message: "Case ports are required" }),
});

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, pccaseId: string}}
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!params.pccaseId) {
            return new NextResponse("Case ID is required", { status: 400 });
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

        const pccase = await prismadb.pccase.updateMany({
            where: {
                id: params.pccaseId,
            },
            data: {
                name,
                model,
                color,
                motherboardSupport,
                ports,
            
            }
        })

        return NextResponse.json(pccase);

    } catch (error) {
        console.log('[PCCASE_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, pccaseId: string}}
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }


        if (!params.pccaseId) {
            return new NextResponse("Case ID is required", { status: 400 });
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

        const pccase = await prismadb.pccase.deleteMany({
            where: {
                id: params.pccaseId,
            }
        });

        return NextResponse.json(pccase);

    } catch (error) {
        console.log('[PCCASE_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};