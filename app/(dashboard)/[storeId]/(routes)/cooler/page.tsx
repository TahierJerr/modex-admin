import { format } from "date-fns"; 

import prismadb from "@/lib/prismadb"

import { CoolerClient } from "./components/client";
import { CoolerColumn } from "./components/columns";
import formatPrice from "@/lib/utils/formatPrice";

const CoolerPage = async ({
    params
}: {
    params: { storeId: string }
}) => {
    const cooler = await prismadb.cooler.findMany({
        where: {
            storeId: params.storeId
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const formattedCooler: CoolerColumn[] = cooler.map((item) => ({
        id: item.id,
        name: item.name,
        price: formatPrice(item.price ?? 0),
        model: item.model,
        type: item.type,
        fanModel: item.fanModel,
        rgb: item.rgb,
        createdAt: format(item.createdAt, "MMMM do, yyyy")
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <CoolerClient data={formattedCooler} />
            </div>
        </div>
    )
}

export default CoolerPage