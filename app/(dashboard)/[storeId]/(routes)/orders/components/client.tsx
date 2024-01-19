"use client";

import { useParams, useRouter } from "next/navigation";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useState } from "react";
import { AlertModal } from "@/components/modals/alert-modal";

import { OrderColumn, columns } from "./columns";

interface OrderClientProps {
    data: OrderColumn[];
}

export const OrderClient: React.FC<OrderClientProps> = ({
    data
}) => {
    const router = useRouter();
    const params = useParams();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const onDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/orders`);
            router.refresh();
            router.push(`/${params.storeId}/orders`);
            toast.success("Unpaid orders deleted.");
        } catch (error) {
            toast.error("Something went wrong.")
        } finally {
            setLoading(false);
            setOpen(false);
        }
    }
    
    return (
        <>
        <AlertModal 
            isOpen={open}
            onClose={() => setOpen(false)}
            onConfirm={onDelete}
            loading={loading}
        />
        <div className="flex items-center justify-between">
            <Heading 
            title={`Orders (${data.length})`}
            description="Manage orders for your store"
            />
            {data.length > 0 && (
                <Button disabled={loading}
                variant="destructive"
                onClick={() => setOpen(true)}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete unpaid orders
                </Button>
            )}
        </div>
        <Separator />
        <DataTable searchKey="label" columns={columns} data={data}/>
        </>
    )
}