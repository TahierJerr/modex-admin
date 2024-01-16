"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

import { MemoryColumn, columns } from "./columns";

interface MemoryClientProps {
    data: MemoryColumn[];
}

export const MemoryClient: React.FC<MemoryClientProps> = ({
    data
}) => {
    const router = useRouter();
    const params = useParams();

    return (
        <>
        <div className="flex items-center justify-between">
            <Heading 
            title={`Memory (${data.length})`}
            description="Manage memory for your store"
            />
            <Button onClick={() => router.push(`/${params.storeId}/memory/new`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New
            </Button>
        </div>
        <Separator />
        <DataTable searchKey="name" columns={columns} data={data}/>
        <Heading title="API" description="API calls for memory"/>
        <ApiList entityName="memory" entityIdName="memoryId"/>
        </>
    )
}