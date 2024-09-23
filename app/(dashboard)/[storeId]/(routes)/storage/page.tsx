import { format } from "date-fns"; 

import prismadb from "@/lib/prismadb"

import { StorageClient } from "./components/client";
import { StorageColumn } from "./components/columns";
import formatPrice from "@/lib/utils/formatPrice";

const StoragePage = async ({
    params
}: {
    params: { storeId: string }
}) => {
    const storage = await prismadb.storage.findMany({
        where: {
            storeId: params.storeId
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const formattedStorage: StorageColumn[] = storage.map((item) => ({
        id: item.id,
        name: item.name,
        model: item.model,
        price: formatPrice(item.price ?? 0),
        productUrl: item.productUrl ?? "",
        type: item.type,
        capacity: item.capacity,
        createdAt: format(item.createdAt, "MMMM do, yyyy")
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <StorageClient data={formattedStorage} />
            </div>
        </div>
    )
}

export default StoragePage