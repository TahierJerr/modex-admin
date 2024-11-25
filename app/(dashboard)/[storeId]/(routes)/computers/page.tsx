import { format } from "date-fns"; 

import prismadb from "@/lib/prismadb"
import { formatter } from "@/lib/utils";

import { ComputerClient } from "./components/client";
import { ComputerColumn } from "./components/columns";

const ComputersPage = async ({
    params
}: {
    params: { storeId: string }
}) => {
    const computers = await prismadb.computer.findMany({
        where: {
            storeId: params.storeId,
            isCustom: false
        },
        include: {
            category: true,
            processor: true,
            graphics: true,
            motherboard: true,
            memory: true,
            storage: true,
            pccase: true,
            color: true,
            cooler: true,
            power: true,
            warranty: true,
            software: true,
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const formattedComputers: ComputerColumn[] = computers.map((item) => ({
        id: item.id,
        name: item.name,
        isFeatured: item.isFeatured,
        isArchived: item.isArchived,
        deliveryTime: item.deliveryTime,
        price: formatter.format(item.price.toNumber()),
        category: item.category.name,
        processors: item.processor.series,
        graphics: item.graphics.name,
        motherboard: item.motherboard.name,
        memory: item.memory.model,
        storage: item.storage.name,
        pccase: item.pccase.name,
        color: item.color.value,
        cooler: item.cooler.name,
        power: item.power.name,
        createdAt: format(item.createdAt, "MMMM do, yyyy")
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ComputerClient data={formattedComputers} />
            </div>
        </div>
    )
}

export default ComputersPage