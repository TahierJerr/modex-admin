"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

import { GraphicsColumn, columns } from "./columns";

interface GraphicsClientProps {
    data: GraphicsColumn[];
}

export const GraphicsClient: React.FC<GraphicsClientProps> = ({
    data
}) => {
    const router = useRouter();
    const params = useParams();

    return (
        <>
        <div className="flex items-center justify-between">
            <Heading 
            title={`Graphics cards (${data.length})`}
            description="Manage graphics cards for your store"
            />
            <Button onClick={() => router.push(`/${params.storeId}/graphics/new`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New
            </Button>
        </div>
        <Separator />
        <DataTable searchKey="name" columns={columns} data={data}/>
        <Heading title="API" description="API calls for graphics cards"/>
        <ApiList entityName="graphics" entityIdName="graphicsId"/>
        </>
    )
}