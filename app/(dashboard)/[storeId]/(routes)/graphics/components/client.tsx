"use client";

import { CalendarCheckIcon, CalendarXIcon, Plus, RefreshCcwIcon } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface GraphicsClientProps {
    data: GraphicsColumn[];
}

export const GraphicsClient: React.FC<GraphicsClientProps> = ({
    data
}) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const params = useParams();
    
    const handleRequest = async (skipDateCheck?: boolean) => {
        
        const skip = 'skipDateCheck=true';
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
    
    const spinningIcon = () => {
        return (
        <RefreshCcwIcon className="spin" size={20} />
        )
    }
    
    return (
    <>
    <div className="flex items-center justify-between">
        <Heading 
        title={`Graphics cards (${data.length})`}
        description="Manage graphics cards for your store"
        />
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white hover:bg-primary-600">
                        {loading ? <>{spinningIcon} Updating...</> : <>{<RefreshCcwIcon size={20} />} Update Prices</>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent>
                    <div className="flex flex-col justify-center items-center gap-4 p-4">
                        <h3 className="text-lg font-semibold">Update Options</h3>
                        <Button onClick={() => handleRequest(true)} className="flex items-center gap-2 bg-blue-600 text-white hover:bg-primary-600">
                            {<CalendarXIcon size={20} />} Update without date check
                        </Button>
                        <Button onClick={() => handleRequest()} className="flex items-center gap-2 bg-blue-600 text-white hover:bg-primary-600">
                            {<CalendarCheckIcon size={20} />} Update with date check
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
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