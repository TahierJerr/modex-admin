"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

import { SoftwareColumn, columns } from "./columns";

interface SoftwareClientProps {
    data: SoftwareColumn[];
}

export const SoftwareClient: React.FC<SoftwareClientProps> = ({
    data
}) => {
    const router = useRouter();
    const params = useParams();

    return (
        <>
        <div className="flex items-center justify-between">
            <Heading 
            title={`Software (${data.length})`}
            description="Manage software for your store"
            />
            <Button onClick={() => router.push(`/${params.storeId}/software/new`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New
            </Button>
        </div>
        <Separator />
        <DataTable searchKey="name" columns={columns} data={data}/>
        <Heading title="API" description="API calls for software"/>
        <ApiList entityName="software" entityIdName="softwareId"/>
        </>
    )
}