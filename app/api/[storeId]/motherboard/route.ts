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

        const { name, model, formFactor, wifi } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!model) {
            return new NextResponse("Motherboard model is required", { status: 400 });
        }

        if (!formFactor) {
            return new NextResponse("Motherboard form factor is required", { status: 400 });
        }

        if (!wifi) {
            return new NextResponse("Motherboard wifi is required", { status: 400 });
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

        const motherboard = await prismadb.motherboard.create({
            data: {
                name,
                model,
                formFactor,
                wifi,
                storeId: params.storeId
            }
        });

        return NextResponse.json(motherboard);
    } catch (error) {
        console.log('[MOTHERBOARD_POST]', error);
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

        const motherboard = await prismadb.motherboard.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(motherboard);
    } catch (error) {
        console.log('MOTHERBOARD_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};