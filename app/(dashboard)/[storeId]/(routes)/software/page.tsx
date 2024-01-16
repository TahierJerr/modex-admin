import { format } from "date-fns"; 

import prismadb from "@/lib/prismadb"

import { SoftwareClient } from "./components/client";
import { SoftwareColumn } from "./components/columns";

const SoftwarePage = async ({
    params
}: {
    params: { storeId: string }
}) => {
    const software = await prismadb.software.findMany({
        where: {
            storeId: params.storeId
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const formattedSoftware: SoftwareColumn[] = software.map((item) => ({
        id: item.id,
        name: item.name,
        createdAt: format(item.createdAt, "MMMM do, yyyy")
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <SoftwareClient data={formattedSoftware} />
            </div>
        </div>
    )
}

export default SoftwarePage