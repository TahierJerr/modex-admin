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

        const { name, brand, model, memory, memoryType, maxClock} = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!brand) {
            return new NextResponse("Brand is required", { status: 400 });
        }

        if (!model) {
            return new NextResponse("GPU model is required", { status: 400 });
        }

        if (!memory) {
            return new NextResponse("GPU memory is required", { status: 400 });
        }

        if (!memoryType) {
            return new NextResponse("GPU memory type is required", { status: 400 });
        }

        if (!maxClock) {
            return new NextResponse("GPU max clock is required", { status: 400 });
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

        const graphics = await prismadb.graphics.create({
            data: {
                name,
                brand,
                model,
                memory,
                memoryType,
                maxClock,
                storeId: params.storeId
            }
        });

        return NextResponse.json(graphics);
    } catch (error) {
        console.log('[GRAPHICS_POST]', error);
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

        const graphics = await prismadb.graphics.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(graphics);
    } catch (error) {
        console.log('[GRAPHICS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};