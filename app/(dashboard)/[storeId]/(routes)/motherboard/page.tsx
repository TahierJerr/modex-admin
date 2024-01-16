import { format } from "date-fns"; 

import prismadb from "@/lib/prismadb"

import { MotherboardClient } from "./components/client";
import { MotherboardColumn } from "./components/columns";

const MotherboardPage = async ({
    params
}: {
    params: { storeId: string }
}) => {
    const motherboard = await prismadb.motherboard.findMany({
        where: {
            storeId: params.storeId
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const formattedMotherboard: MotherboardColumn[] = motherboard.map((item) => ({
        id: item.id,
        name: item.name,
        model: item.model,
        formFactor: item.formFactor,
        wifi: item.wifi,
        createdAt: format(item.createdAt, "MMMM do, yyyy")
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <MotherboardClient data={formattedMotherboard} />
            </div>
        </div>
    )
}

export default MotherboardPage