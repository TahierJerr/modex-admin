import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET (
    req: Request,
    { params }: { params: { coolerId: string}}
) {
    try {
        if (!params.coolerId) {
            return new NextResponse("Cooler ID is required", { status: 400 });
        }

        const cooler = await prismadb.cooler.findUnique({
            where: {
                id: params.coolerId,
            }
        });

        return NextResponse.json(cooler);

    } catch (error) {
        console.log('[COOLER_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, coolerId: string}}
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

        if (!params.coolerId) {
            return new NextResponse("Cooler ID is required", { status: 400 });
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

        const cooler = await prismadb.cooler.updateMany({
            where: {
                id: params.coolerId,
            },
            data: {
                name,
            }
        })

        return NextResponse.json(cooler);

    } catch (error) {
        console.log('[COOLER_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, coolerId: string}}
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }


        if (!params.coolerId) {
            return new NextResponse("Cooler ID is required", { status: 400 });
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

        const cooler = await prismadb.cooler.deleteMany({
            where: {
                id: params.coolerId,
            }
        });

        return NextResponse.json(cooler);

    } catch (error) {
        console.log('[COOLER_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};