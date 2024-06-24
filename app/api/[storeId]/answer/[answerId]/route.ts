import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET (
    req: Request,
    { params }: { params: { answerId: string}}
) {
    try {
        const { userId } = auth();

        if (!params.answerId) {
            return new NextResponse("FAQ ID is required", { status: 400 });
        }

        const answer = await prismadb.answer.findUnique({
            where: {
                id: params.answerId,
            }
        });

        return NextResponse.json(answer);

    } catch (error) {
        console.log('[ANSWER_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, answerId: string}}
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const { question, answers } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!question) {
            return new NextResponse("Question is required", { status: 400 });
        }

        if (!answers) {
            return new NextResponse("Answer is required", { status: 400 });
        }

        if (!params.answerId) {
            return new NextResponse("FAQ ID is required", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where : {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const answer = await prismadb.answer.updateMany({
            where: {
                id: params.answerId,
            },
            data: {
                question,
                answers,
            
            }
        })

        return NextResponse.json(answer);

    } catch (error) {
        console.log('[ANSWER_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, answerId: string}}
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }


        if (!params.answerId) {
            return new NextResponse("FAQ ID is required", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where : {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const answer = await prismadb.answer.deleteMany({
            where: {
                id: params.answerId,
            }
        });

        return NextResponse.json(answer);

    } catch (error) {
        console.log('[ANSWER_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};