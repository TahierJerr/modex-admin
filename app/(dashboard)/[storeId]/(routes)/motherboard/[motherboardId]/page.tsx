import prismadb from "@/lib/prismadb";


import { MotherboardForm } from "./components/motherboard-form";


const MotherboardPage = async ({
    params 
}: {
    params: { motherboardId: string }
}) => {
    const motherboard = await prismadb.motherboard.findUnique({
        where: {
            id: params.motherboardId
        }
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <MotherboardForm initialData={motherboard} />
            </div>
        </div>
    );
}

export default MotherboardPage;