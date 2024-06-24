import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET (
    req: Request,
    { params }: { params: { softwareId: string}}
) {
    try {
        if (!params.softwareId) {
            return new NextResponse("Software ID is required", { status: 400 });
        }

        const software = await prismadb.software.findUnique({
            where: {
                id: params.softwareId,
            }
        });

        return NextResponse.json(software);

    } catch (error) {
        console.log('[SOFTWARE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, softwareId: string}}
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

        if (!params.softwareId) {
            return new NextResponse("Software ID is required", { status: 400 });
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

        const software = await prismadb.software.updateMany({
            where: {
                id: params.softwareId,
            },
            data: {
                name,
            }
        })

        return NextResponse.json(software);

    } catch (error) {
        console.log('[SOFTWARE_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, softwareId: string}}
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }


        if (!params.softwareId) {
            return new NextResponse("Software ID is required", { status: 400 });
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

        const software = await prismadb.software.deleteMany({
            where: {
                id: params.softwareId,
            }
        });

        return NextResponse.json(software);

    } catch (error) {
        console.log('[SOFTWARE_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};