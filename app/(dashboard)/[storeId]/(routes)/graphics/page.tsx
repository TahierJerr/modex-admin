import { format } from "date-fns"; 

import prismadb from "@/lib/prismadb"

import { GraphicsClient } from "./components/client";
import { GraphicsColumn } from "./components/columns";
import formatPrice from "@/lib/utils/formatPrice";

const GraphicsPage = async ({
    params
}: {
    params: { storeId: string }
}) => {
    const graphics = await prismadb.graphics.findMany({
        where: {
            storeId: params.storeId
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const formattedGraphics: GraphicsColumn[] = graphics.map((item) => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        model: item.model,
        price: formatPrice(item.price ?? 0),
        productUrl: item.productUrl ?? "",
        memory: item.memory,
        memoryType: item.memoryType,
        maxClock: item.maxClock,
        createdAt: format(item.createdAt, "MMMM do, yyyy")
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <GraphicsClient data={formattedGraphics} />
            </div>
        </div>
    )
}

export default GraphicsPage