import prismadb from "@/lib/prismadb";


import { PccaseForm } from "./components/pccase-form";


const PccasePage = async ({
    params 
}: {
    params: { pccaseId: string }
}) => {
    const pccase = await prismadb.pccase.findUnique({
        where: {
            id: params.pccaseId
        }
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <PccaseForm initialData={pccase} />
            </div>
        </div>
    );
}

export default PccasePage;