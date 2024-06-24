import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";

import prismadb from '@/lib/prismadb';

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { name, model, color, motherboardSupport, ports } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!model) {
            return new NextResponse("Case model is required", { status: 400 });
        }

        if (!color) {
            return new NextResponse("Case color is required", { status: 400 });
        }

        if (!motherboardSupport) {
            return new NextResponse("Case motherboard support is required", { status: 400 });
        }

        if (!ports) {
            return new NextResponse("Case ports are required", { status: 400 });
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