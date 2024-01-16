import prismadb from "@/lib/prismadb";


import { SoftwareForm } from "./components/software-form";


const SoftwarePage = async ({
    params 
}: {
    params: { softwareId: string }
}) => {
    const software = await prismadb.software.findUnique({
        where: {
            id: params.softwareId
        }
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <SoftwareForm initialData={software} />
            </div>
        </div>
    );
}

export default SoftwarePage;