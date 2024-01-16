import { format } from "date-fns"; 

import prismadb from "@/lib/prismadb"

import { AnswerClient } from "./components/client";
import { AnswerColumn } from "./components/columns";

const AnswerPage = async ({
    params
}: {
    params: { storeId: string }
}) => {
    const answer = await prismadb.answer.findMany({
        where: {
            storeId: params.storeId
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const formattedAnswers: AnswerColumn[] = answer.map((item) => ({
        id: item.id,
        question: item.question,
        createdAt: format(item.createdAt, "MMMM do, yyyy")
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <AnswerClient data={formattedAnswers} />
            </div>
        </div>
    )
}

export default AnswerPage