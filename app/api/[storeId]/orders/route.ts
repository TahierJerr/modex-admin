import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";

import prismadb from '@/lib/prismadb';

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string}}
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
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

        const unpaidOrders = await prismadb.order.findMany({
            where: {
                storeId: params.storeId,
                isPaid: false
            }
        });

        for (const order of unpaidOrders) {
            await prismadb.orderItem.deleteMany({
                where: {
                    orderId: order.id
                }
            });
        }

        const orders = await prismadb.order.deleteMany({
            where: {
                storeId: params.storeId,
                isPaid: false
            }
        });

        return NextResponse.json(orders);

    } catch (error) {
        console.log('[ORDER_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};
