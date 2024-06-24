import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET (
    req: Request,
    { params }: { params: { warrantyId: string}}
) {
    try {
        if (!params.warrantyId) {
            return new NextResponse("Warranty ID is required", { status: 400 });
        }

        const warranty = await prismadb.warranty.findUnique({
            where: {
                id: params.warrantyId,
            }
        });

        return NextResponse.json(warranty);

    } catch (error) {
        console.log('[WARRANTY_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, warrantyId: string}}
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { name } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!params.warrantyId) {
            return new NextResponse("Warranty ID is required", { status: 400 });
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

        const warranty = await prismadb.warranty.updateMany({
            where: {
                id: params.warrantyId,
            },
            data: {
                name
            
            }
        })

        return NextResponse.json(warranty);

    } catch (error) {
        console.log('[WARRANTY_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, warrantyId: string}}
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }


        if (!params.warrantyId) {
            return new NextResponse("Warranty ID is required", { status: 400 });
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

        const warranty = await prismadb.warranty.deleteMany({
            where: {
                id: params.warrantyId,
            }
        });

        return NextResponse.json(warranty);

    } catch (error) {
        console.log('[WARRANTY_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};