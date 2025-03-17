import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/dist/types/server';

const answerSchema = z.object({
    question: z.string().min(1, { message: "Question is required" }),
    answers: z.string().min(1, { message: "Answers is required" }),
});

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const body = await req.json();

        const validation = answerSchema.safeParse(body);

        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 });
        }

        const { question, answers } = validation.data;

        const storeByUserId = await prismadb.store.findFirst({
            where : {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const answer = await prismadb.answer.create({
            data: {
                question,
                answers,
                storeId: params.storeId
            }
        });

        return NextResponse.json(answer);
    } catch (error) {
        console.log('[ANSWER_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function GET(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {

        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const answer = await prismadb.answer.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(answer);
    } catch (error) {
        console.log('[ANSWER_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};