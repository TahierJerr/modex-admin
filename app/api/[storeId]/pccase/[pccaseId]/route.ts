import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET (
    req: Request,
    { params }: { params: { pccaseId: string}}
) {
    try {
        if (!params.pccaseId) {
            return new NextResponse("Case ID is required", { status: 400 });
        }

        const pccase = await prismadb.pccase.findUnique({
            where: {
                id: params.pccaseId,
            }
        });

        return NextResponse.json(pccase);

    } catch (error) {
        console.log('[PCCASE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, pccaseId: string}}
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { name, model, color, motherboardSupport, ports } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!model) {
            return new NextResponse("Case model is required", { status: 400 });
        }

        if (!color) {
            return new NextResponse("Case color is required", { status: 400 });
        }

        if (!motherboardSupport) {
            return new NextResponse("Case motherboard support is required", { status: 400 });
        }

        if (!ports) {
            return new NextResponse("Case ports are required", { status: 400 });
        }

        if (!params.pccaseId) {
            return new NextResponse("Case ID is required", { status: 400 });
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

        const pccase = await prismadb.pccase.updateMany({
            where: {
                id: params.pccaseId,
            },
            data: {
                name,
                model,
                color,
                motherboardSupport,
                ports,
            
            }
        })

        return NextResponse.json(pccase);

    } catch (error) {
        console.log('[PCCASE_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, pccaseId: string}}
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }


        if (!params.pccaseId) {
            return new NextResponse("Case ID is required", { status: 400 });
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

        const pccase = await prismadb.pccase.deleteMany({
            where: {
                id: params.pccaseId,
            }
        });

        return NextResponse.json(pccase);

    } catch (error) {
        console.log('[PCCASE_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};