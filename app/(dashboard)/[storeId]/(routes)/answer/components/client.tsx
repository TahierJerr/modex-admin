"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

import { AnswerColumn, columns } from "./columns";

interface AnswerClientProps {
    data: AnswerColumn[];
}

export const AnswerClient: React.FC<AnswerClientProps> = ({
    data
}) => {
    const router = useRouter();
    const params = useParams();

    return (
        <>
        <div className="flex items-center justify-between">
            <Heading 
            title={`FAQ (${data.length})`}
            description="Manage answer for your store"
            />
            <Button onClick={() => router.push(`/${params.storeId}/answer/new`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New
            </Button>
        </div>
        <Separator />
        <DataTable searchKey="question" columns={columns} data={data}/>
        <Heading title="API" description="API calls for FAQ"/>
        <ApiList entityName="answer" entityIdName="answerId"/>
        </>
    )
}