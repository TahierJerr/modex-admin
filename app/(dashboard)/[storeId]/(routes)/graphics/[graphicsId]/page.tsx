import prismadb from "@/lib/prismadb";

import { GraphicsForm } from "./components/graphics-form";


const GraphicsPage = async ({
    params 
}: {
    params: { graphicsId: string }
}) => {
    const graphics = await prismadb.graphics.findUnique({
        where: {
            id: params.graphicsId
        }
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <GraphicsForm initialData={graphics} />
            </div>
        </div>
    );
}

export default GraphicsPage;