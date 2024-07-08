import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prismadb from '@/lib/prismadb';
import { z } from 'zod';

const powerSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "PSU model is required" }),
    wattage: z.string().min(1, { message: "PSU wattage is required" }),
    rating: z.string().min(1, { message: "PSU rating is required" }),
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

        const validation = powerSchema.safeParse(body);
        
        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 });
        }

        const { name, model, wattage, rating } = validation.data;

        const storeByUserId = await prismadb.store.findFirst({
            where : {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const power = await prismadb.power.create({
            data: {
                name,
                model,
                wattage,
                rating,
                storeId: params.storeId
            }
        });

        return NextResponse.json(power);
    } catch (error) {
        console.log('[POWER_POST]', error);
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

        const power = await prismadb.power.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(power);
    } catch (error) {
        console.log('POWER_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};