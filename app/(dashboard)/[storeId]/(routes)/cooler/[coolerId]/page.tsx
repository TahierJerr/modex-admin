import prismadb from "@/lib/prismadb";


import { CoolerForm } from "./components/cooler-form";


const CoolerPage = async ({
    params 
}: {
    params: { coolerId: string }
}) => {
    const cooler = await prismadb.cooler.findUnique({
        where: {
            id: params.coolerId
        }
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <CoolerForm initialData={cooler} />
            </div>
        </div>
    );
}

export default CoolerPage;