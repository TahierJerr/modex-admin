import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { name, brand, series, baseSpeed, cores } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!brand) {
            return new NextResponse("Brand is required", { status: 400 });
        }

        if (!series) {
            return new NextResponse("Processor series is required", { status: 400 });
        }

        if (!baseSpeed) {
            return new NextResponse("Processor base speed is required", { status: 400 });
        }

        if (!cores) {
            return new NextResponse("Processor cores is required", { status: 400 });
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

        const processor = await prismadb.processor.create({
            data: {
                name,
                brand,
                series,
                baseSpeed,
                cores,
                storeId: params.storeId
            }
        });

        return NextResponse.json(processor);
    } catch (error) {
        console.log('[PROCESSORS_POST]', error);
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

        const processor = await prismadb.processor.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(processor);
    } catch (error) {
        console.log('[PROCESSORS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};