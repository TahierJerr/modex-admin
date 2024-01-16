import { format } from "date-fns"; 

import prismadb from "@/lib/prismadb"

import { PowerClient } from "./components/client";
import { PowerColumn } from "./components/columns";

const PowerPage = async ({
    params
}: {
    params: { storeId: string }
}) => {
    const power = await prismadb.power.findMany({
        where: {
            storeId: params.storeId
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const formattedPower: PowerColumn[] = power.map((item) => ({
        id: item.id,
        name: item.name,
        model: item.model,
        wattage: item.wattage,
        rating: item.rating,
        createdAt: format(item.createdAt, "MMMM do, yyyy")
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <PowerClient data={formattedPower} />
            </div>
        </div>
    )
}

export default PowerPage