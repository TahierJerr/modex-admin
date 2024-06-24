import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET (
    req: Request,
    { params }: { params: { processorId: string}}
) {
    try {
        if (!params.processorId) {
            return new NextResponse("Processor ID is required", { status: 400 });
        }

        const processor = await prismadb.processor.findUnique({
            where: {
                id: params.processorId,
            }
        });

        return NextResponse.json(processor);

    } catch (error) {
        console.log('[PROCESSOR_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, processorId: string}}
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

        if (!params.processorId) {
            return new NextResponse("Processor ID is required", { status: 400 });
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

        const processor = await prismadb.processor.updateMany({
            where: {
                id: params.processorId,
            },
            data: {
                name,
                brand,
                series,
                baseSpeed,
                cores,
            
            }
        })

        return NextResponse.json(processor);

    } catch (error) {
        console.log('[PROCESSOR_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, processorId: string}}
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }


        if (!params.processorId) {
            return new NextResponse("processor ID is required", { status: 400 });
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

        const processor = await prismadb.processor.deleteMany({
            where: {
                id: params.processorId,
            }
        });

        return NextResponse.json(processor);

    } catch (error) {
        console.log('[PROCESSOR_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};