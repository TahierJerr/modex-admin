"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

import { PccaseColumn, columns } from "./columns";

interface PccaseClientProps {
    data: PccaseColumn[];
}

export const PccaseClient: React.FC<PccaseClientProps> = ({
    data
}) => {
    const router = useRouter();
    const params = useParams();

    return (
        <>
        <div className="flex items-center justify-between">
            <Heading 
            title={`Case (${data.length})`}
            description="Manage cases for your store"
            />
            <Button onClick={() => router.push(`/${params.storeId}/pccase/new`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New
            </Button>
        </div>
        <Separator />
        <DataTable searchKey="name" columns={columns} data={data}/>
        <Heading title="API" description="API calls for cases"/>
        <ApiList entityName="pccase" entityIdName="pccaseId"/>
        </>
    )
}