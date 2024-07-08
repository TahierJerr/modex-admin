import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prismadb from '@/lib/prismadb';
import { z } from 'zod';

const processorSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    brand: z.string().min(1, { message: "Brand is required" }),
    series: z.string().min(1, { message: "Processor series is required" }),
    baseSpeed: z.string().min(1, { message: "Processor base speed is required" }),
    cores: z.string().min(1, { message: "Processor cores is required" }),
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

        const validation = processorSchema.safeParse(body);
        
        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 });
        }

        const { name, brand, series, baseSpeed, cores } = validation.data;

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