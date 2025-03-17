import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/dist/types/server';

const billboardSchema = z.object({
    label: z.string().min(1, { message: "Label is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    imageUrl: z.string().min(1, { message: "Image URL is required" }),
});

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const body = await req.json();

        const validation = billboardSchema.safeParse(body);

        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 });
        }

        const { label, description, imageUrl } = validation.data;

        const storeByUserId = await prismadb.store.findFirst({
            where : {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const billboard = await prismadb.billboard.create({
            data: {
                label,
                description,
                imageUrl,
                storeId: params.storeId
            }
        });

        return NextResponse.json(billboard);
    } catch (error) {
        console.log('[BILLBOARDS_POST]', error);
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

        const billboard = await prismadb.billboard.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(billboard);
    } catch (error) {
        console.log('[BILLBOARDS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};