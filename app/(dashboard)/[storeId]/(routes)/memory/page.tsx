import { format } from "date-fns"; 

import prismadb from "@/lib/prismadb"

import { MemoryClient } from "./components/client";
import { MemoryColumn } from "./components/columns";
import formatPrice from "@/lib/utils/formatPrice";

const MemoryPage = async ({
    params
}: {
    params: { storeId: string }
}) => {
    const memory = await prismadb.memory.findMany({
        where: {
            storeId: params.storeId
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    

    const formattedMemory: MemoryColumn[] = memory.map((item) => ({
        id: item.id,
        name: item.name,
        model: item.model,
        type: item.type,
        speed: item.speed,
        productUrl: item.productUrl ?? "",
        price: formatPrice(item.price ?? 0),
        capacity: item.capacity,
        rgb: item.rgb,
        createdAt: format(item.createdAt, "MMMM do, yyyy")
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <MemoryClient data={formattedMemory} />
            </div>
        </div>
    )
}

export default MemoryPage