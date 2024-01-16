import { format } from "date-fns"; 

import prismadb from "@/lib/prismadb"

import { ProcessorClient } from "./components/client";
import { ProcessorColumn } from "./components/columns";

const ProcessorsPage = async ({
    params
}: {
    params: { storeId: string }
}) => {
    const processors = await prismadb.processor.findMany({
        where: {
            storeId: params.storeId
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const formattedProcessors: ProcessorColumn[] = processors.map((item) => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        series: item.series,
        baseSpeed: item.baseSpeed,
        cores: item.cores,
        createdAt: format(item.createdAt, "MMMM do, yyyy")
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ProcessorClient data={formattedProcessors} />
            </div>
        </div>
    )
}

export default ProcessorsPage