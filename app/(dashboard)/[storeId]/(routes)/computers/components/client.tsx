"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

import { ComputerColumn, columns } from "./columns";

interface ComputerClientProps {
    data: ComputerColumn[];
}

export const ComputerClient: React.FC<ComputerClientProps> = ({
    data
}) => {
    const router = useRouter();
    const params = useParams();

    return (
        <>
        <div className="flex items-center justify-between">
            <Heading 
            title={`Computers (${data.length})`}
            description="Manage computers for your store"
            />
            <Button onClick={() => router.push(`/${params.storeId}/computers/new`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New
            </Button>
        </div>
        <Separator />
        <DataTable searchKey="name" columns={columns} data={data}/>
        <Heading title="API" description="API calls for computers"/>
        <ApiList entityName="computers" entityIdName="computerId"/>
        </>
    )
}