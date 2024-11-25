import prismadb from "@/lib/prismadb";


import { ComputerForm } from "./components/computer-form";


const ComputerPage = async ({
    params 
}: {
    params: { computerId: string, storeId: string },
}) => {
    const computers = await prismadb.computer.findUnique({
        where: {
            id: params.computerId,
            isCustom: false,
        },
        include: {
            images: true
        }
    });

    const categories = await prismadb.category.findMany({
        where: {
            storeId: params.storeId,
        }
    })

    const processors = await prismadb.processor.findMany({
        where: {
            storeId: params.storeId,
        }
    })

    const memories = await prismadb.memory.findMany({
        where: {
            storeId: params.storeId,
        }
    })

    const storages = await prismadb.storage.findMany({
        where: {
            storeId: params.storeId,
        }
    })

    const graphics = await prismadb.graphics.findMany({
        where: {
            storeId: params.storeId,
        }
    })

    const motherboards = await prismadb.motherboard.findMany({
        where: {
            storeId: params.storeId,
        }
    })

    const powers = await prismadb.power.findMany({
        where: {
            storeId: params.storeId,
        }
    })

    const pccases = await prismadb.pccase.findMany({
        where: {
            storeId: params.storeId,
        }
    })

    const softwares = await prismadb.software.findMany({
        where: {
            storeId: params.storeId,
        }
    })

    const colors = await prismadb.color.findMany({
        where: {
            storeId: params.storeId,
        }
    })

    const warranties = await prismadb.warranty.findMany({
        where: {
            storeId: params.storeId,
        }
    })

    const coolers = await prismadb.cooler.findMany({
        where: {
            storeId: params.storeId,
        }
    })

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ComputerForm 
                    categories={categories}
                    processors={processors}
                    memories={memories}
                    storages={storages}
                    graphics={graphics}
                    motherboards={motherboards}
                    powers={powers}
                    pccases={pccases}
                    softwares={softwares}
                    colors={colors}
                    warranties={warranties}
                    coolers={coolers}
                initialData={computers} />
            </div>
        </div>
    );
}

export default ComputerPage;