"use client";

import { CalendarCheckIcon, CalendarXIcon, Plus, RefreshCcwIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

import { ComputerColumn, columns } from "./columns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

interface ComputerClientProps {
    data: ComputerColumn[];
}

export const ComputerClient: React.FC<ComputerClientProps> = ({
    data
}) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const params = useParams();

    const handleRequest = async (skipDateCheck: boolean = false) => {
        
        try {
            setLoading(true);
            await axios.get(`/api/${params.storeId}/updatePrices?skipDateCheck=${skipDateCheck}&productModel=all`);
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
            title={`Computers (${data.length})`}
            description="Manage computers for your store"
            />
            <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white hover:bg-primary-600">
                        {loading ? <>{spinningIcon} Updating...</> : <>{<RefreshCcwIcon size={20} />} Update Component Prices</>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent>
                    <div className="flex flex-col items-center gap-4 p-4">
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
            <Button onClick={() => router.push(`/${params.storeId}/computers/new`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New
            </Button>
        </div>
        </div>
        <Separator />
        <DataTable searchKey="name" columns={columns} data={data}/>
        <Heading title="API" description="API calls for computers"/>
        <ApiList entityName="computers" entityIdName="computerId"/>
        </>
    )
}