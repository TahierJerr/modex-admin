import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import prismadb from '@/lib/prismadb';
import { z } from 'zod';

const softwareSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
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

        const validation = softwareSchema.safeParse(body);
        
        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 });
        }

        const { name } = validation.data;

        const storeByUserId = await prismadb.store.findFirst({
            where : {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const software = await prismadb.software.create({
            data: {
                name,
                storeId: params.storeId
            }
        });

        return NextResponse.json(software);
    } catch (error) {
        console.log('[SOFTWARE_POST]', error);
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

        const software = await prismadb.software.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(software);
    } catch (error) {
        console.log('[SOFTWARE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};