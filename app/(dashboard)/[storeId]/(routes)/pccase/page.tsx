import { format } from "date-fns"; 

import prismadb from "@/lib/prismadb"

import { PccaseClient } from "./components/client";
import { PccaseColumn } from "./components/columns";

const PccasePage = async ({
    params
}: {
    params: { storeId: string }
}) => {
    const pccase = await prismadb.pccase.findMany({
        where: {
            storeId: params.storeId
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const formattedPccase: PccaseColumn[] = pccase.map((item) => ({
        id: item.id,
        name: item.name,
        model: item.model,
        color: item.color,
        motherboardSupport: item.motherboardSupport,
        ports: item.ports,
        createdAt: format(item.createdAt, "MMMM do, yyyy")
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <PccaseClient data={formattedPccase} />
            </div>
        </div>
    )
}

export default PccasePage