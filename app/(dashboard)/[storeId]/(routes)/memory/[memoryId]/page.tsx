import prismadb from "@/lib/prismadb";


import { MemoryForm } from "./components/memory-form";


const MemoryPage = async ({
    params 
}: {
    params: { memoryId: string }
}) => {
    const memory = await prismadb.memory.findUnique({
        where: {
            id: params.memoryId
        }
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <MemoryForm initialData={memory} />
            </div>
        </div>
    );
}

export default MemoryPage;