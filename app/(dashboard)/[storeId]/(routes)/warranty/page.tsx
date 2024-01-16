import { format } from "date-fns"; 

import prismadb from "@/lib/prismadb"

import { WarrantyClient } from "./components/client";
import { WarrantyColumn } from "./components/columns";

const WarrantyPage = async ({
    params
}: {
    params: { storeId: string }
}) => {
    const warranty = await prismadb.warranty.findMany({
        where: {
            storeId: params.storeId
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const formattedWarranty: WarrantyColumn[] = warranty.map((item) => ({
        id: item.id,
        name: item.name,
        createdAt: format(item.createdAt, "MMMM do, yyyy")
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <WarrantyClient data={formattedWarranty} />
            </div>
        </div>
    )
}

export default WarrantyPage