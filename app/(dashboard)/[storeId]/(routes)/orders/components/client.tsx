"use client";

import { useParams, useRouter } from "next/navigation";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

import { OrderColumn, columns } from "./columns";

interface OrderClientProps {
    data: OrderColumn[];
}

export const OrderClient: React.FC<OrderClientProps> = ({
    data
}) => {
    const router = useRouter();
    const params = useParams();
    
    return (
        <>
        <div className="flex items-center justify-between">
            <Heading 
            title={`Orders (${data.length})`}
            description="Manage orders for your store"
            />
            <Button className="hidden" onClick={() => router.push(``)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete unpaid orders
            </Button>
        </div>
        <Separator />
        <DataTable searchKey="label" columns={columns} data={data}/>
        </>
    )
}