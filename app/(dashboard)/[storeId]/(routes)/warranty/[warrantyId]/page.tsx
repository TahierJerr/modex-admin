import prismadb from "@/lib/prismadb";


import { WarrantyForm } from "./components/warranty-form";


const WarrantyPage = async ({
    params 
}: {
    params: { warrantyId: string }
}) => {
    const warranty = await prismadb.warranty.findUnique({
        where: {
            id: params.warrantyId
        }
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <WarrantyForm initialData={warranty} />
            </div>
        </div>
    );
}

export default WarrantyPage;