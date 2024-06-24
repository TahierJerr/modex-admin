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

        const { name, model, type, fanModel, rgb } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!model) {
            return new NextResponse("Cooler model is required", { status: 400 });
        }

        if (!type) {
            return new NextResponse("Cooler type is required", { status: 400 });
        }

        if (!fanModel) {
            return new NextResponse("Cooler fan model is required", { status: 400 });
        }

        if (!rgb) {
            return new NextResponse("Cooler RGB is required", { status: 400 });
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

        const cooler = await prismadb.cooler.create({
            data: {
                name,
                model,
                type,
                fanModel,
                rgb,
                storeId: params.storeId
            }
        });

        return NextResponse.json(cooler);
    } catch (error) {
        console.log('[COOLER_POST]', error);
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

        const cooler = await prismadb.cooler.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(cooler);
    } catch (error) {
        console.log('[COOLER_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};