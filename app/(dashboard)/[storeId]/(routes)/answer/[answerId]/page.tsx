import prismadb from "@/lib/prismadb";


import { AnswerForm } from "./components/answer-form";


const AnswerPage = async ({
    params 
}: {
    params: { answerId: string }
}) => {
    const answer = await prismadb.answer.findUnique({
        where: {
            id: params.answerId
        }
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <AnswerForm initialData={answer} />
            </div>
        </div>
    );
}

export default AnswerPage;