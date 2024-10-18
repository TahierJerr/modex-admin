"use client";

import { Plus, RefreshCcwIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

import { GraphicsColumn, columns } from "./columns";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import Loading from "@/components/ui/loading";

interface GraphicsClientProps {
    data: GraphicsColumn[];
}

export const GraphicsClient: React.FC<GraphicsClientProps> = ({
    data
}) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const params = useParams();

    const handleRequest = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/${params.storeId}/updatePrices?skipDateCheck=true`);
            toast.success("Prices updated successfully");
            router.refresh();
        } catch (error) {
            toast.error(`Failed to update prices
            Error: ${error}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
        <div className="flex items-center justify-between">
            <Heading 
            title={`Graphics cards (${data.length})`}
            description="Manage graphics cards for your store"
            />
            <div className="flex items-center gap-2">
            <Button onClick={handleRequest} disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white hover:bg-primary-600">
                {loading ? <>{<Loading />} Updating...</> : <>{<RefreshCcwIcon size={20} />} Update Prices</>}
            </Button>
            <Button onClick={() => router.push(`/${params.storeId}/graphics/new`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New
            </Button>
            </div>
        </div>
        <Separator />
        <DataTable searchKey="name" columns={columns} data={data}/>
        <Heading title="API" description="API calls for graphics cards"/>
        <ApiList entityName="graphics" entityIdName="graphicsId"/>
        </>
    )
}