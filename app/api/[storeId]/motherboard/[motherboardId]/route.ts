import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET (
    req: Request,
    { params }: { params: { motherboardId: string}}
) {
    try {
        if (!params.motherboardId) {
            return new NextResponse("Motherboard ID is required", { status: 400 });
        }

        const motherboard = await prismadb.motherboard.findUnique({
            where: {
                id: params.motherboardId,
            }
        });

        return NextResponse.json(motherboard);

    } catch (error) {
        console.log('[MOTHERBOARD_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, motherboardId: string}}
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { name, model, formFactor, wifi } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!model) {
            return new NextResponse("Motherboard model is required", { status: 400 });
        }

        if (!formFactor) {
            return new NextResponse("Motherboard form factor is required", { status: 400 });
        }

        if (!wifi) {
            return new NextResponse("Motherboard wifi is required", { status: 400 });
        }

        if (!params.motherboardId) {
            return new NextResponse("Motherboard ID is required", { status: 400 });
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

        const motherboard = await prismadb.motherboard.updateMany({
            where: {
                id: params.motherboardId,
            },
            data: {
                name,
                model,
                formFactor,
                wifi,
            
            }
        })

        return NextResponse.json(motherboard);

    } catch (error) {
        console.log('[MOTHERBOARD_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, motherboardId: string}}
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }


        if (!params.motherboardId) {
            return new NextResponse("Motherboard ID is required", { status: 400 });
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

        const motherboard = await prismadb.motherboard.deleteMany({
            where: {
                id: params.motherboardId,
            }
        });

        return NextResponse.json(motherboard);

    } catch (error) {
        console.log('[MOTHERBOARD_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};