import prismadb from "@/lib/prismadb";


import { ProcessorForm } from "./components/processor-form";


const ProcessorPage = async ({
    params 
}: {
    params: { processorId: string }
}) => {
    const processor = await prismadb.processor.findUnique({
        where: {
            id: params.processorId
        }
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ProcessorForm initialData={processor} />
            </div>
        </div>
    );
}

export default ProcessorPage;