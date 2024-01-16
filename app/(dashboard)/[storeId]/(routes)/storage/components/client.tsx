"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

import { StorageColumn, columns } from "./columns";

interface StorageClientProps {
    data: StorageColumn[];
}

export const StorageClient: React.FC<StorageClientProps> = ({
    data
}) => {
    const router = useRouter();
    const params = useParams();

    return (
        <>
        <div className="flex items-center justify-between">
            <Heading 
            title={`Storage (${data.length})`}
            description="Manage storage for your store"
            />
            <Button onClick={() => router.push(`/${params.storeId}/storage/new`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New
            </Button>
        </div>
        <Separator />
        <DataTable searchKey="name" columns={columns} data={data}/>
        <Heading title="API" description="API calls for storage"/>
        <ApiList entityName="storage" entityIdName="storageId"/>
        </>
    )
}