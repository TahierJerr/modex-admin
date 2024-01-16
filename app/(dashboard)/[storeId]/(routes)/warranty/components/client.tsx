"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

import { WarrantyColumn, columns } from "./columns";

interface WarrantyClientProps {
    data: WarrantyColumn[];
}

export const WarrantyClient: React.FC<WarrantyClientProps> = ({
    data
}) => {
    const router = useRouter();
    const params = useParams();

    return (
        <>
        <div className="flex items-center justify-between">
            <Heading 
            title={`Warranty (${data.length})`}
            description="Manage warranty for your products"
            />
            <Button onClick={() => router.push(`/${params.storeId}/warranty/new`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New
            </Button>
        </div>
        <Separator />
        <DataTable searchKey="name" columns={columns} data={data}/>
        <Heading title="API" description="API calls for Warranty"/>
        <ApiList entityName="warranty" entityIdName="warrantyId"/>
        </>
    )
}