import { format } from "date-fns"; 

import prismadb from "@/lib/prismadb"

import { formatter } from "@/lib/utils";
import { OrderClient } from "./components/client";
import { OrderColumn } from "./components/columns";

const OrdersPage = async ({
    params
}: {
    params: { storeId: string }
}) => {
    const orders = await prismadb.order.findMany({
        where: {
            storeId: params.storeId,
            isPaid: false
        },
        include: {
            orderItems: {
                include: {
                    computer: true,
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const formattedOrders: OrderColumn[] = orders.map((item) => ({
        id: item.id,
        phone: item.phone,
        address: item.address,
        computers: item.orderItems.map((orderItem) => orderItem.computer.name).join(', '),
        totalPrice: formatter.format(item.orderItems.reduce((total, item) => {
            return total + Number(item.computer.price)
        }, 0)),
        isPaid: item.isPaid,
        createdAt: format(item.createdAt, "MMMM do, yyyy")
    }));

    orders.forEach(async (order) => {
        if (!order.isPaid) {
            await prismadb.order.delete({
                where: {
                    id: order.id
                }
            });
        }
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <OrderClient data={formattedOrders} />
            </div>
        </div>
    )
}

export default OrdersPage