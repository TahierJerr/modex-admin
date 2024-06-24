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

        const { name, model, type, capacity, } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!model) {
            return new NextResponse("Storage model is required", { status: 400 });
        }

        if (!type) {
            return new NextResponse("Storage type is required", { status: 400 });
        }

        if (!capacity) {
            return new NextResponse("Storage capacity is required", { status: 400 });
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

        const storage = await prismadb.storage.create({
            data: {
                name,
                model,
                type,
                capacity,
                storeId: params.storeId
            }
        });

        return NextResponse.json(storage);
    } catch (error) {
        console.log('[STORAGE_POST]', error);
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

        const storage = await prismadb.storage.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(storage);
    } catch (error) {
        console.log('STORAGE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};