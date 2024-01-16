import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
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

        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
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