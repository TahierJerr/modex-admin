import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";
import { handleProductRemoval } from "@/lib/functions/handleProductRemoval";
import { handleProductModification } from "@/lib/functions/handleProductModification";

export async function GET (
    req: Request,
    { params }: { params: { colorId: string}}
) {
    try {
        if (!params.colorId) {
            return new NextResponse("Color ID is required", { status: 400 });
        }

        const color = await prismadb.color.findUnique({
            where: {
                id: params.colorId,
            }
        });

        return NextResponse.json(color);

    } catch (error) {
        console.log('[COLOR_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

const colorSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    value: z.string().min(1, { message: "Value is required" }),
});

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, colorId: string}}
) {
    try {
        const color = await handleProductModification(req, { storeId: params.storeId, productId: params.colorId }, colorSchema, "COLOR", prismadb.color, (data) => data);

        return NextResponse.json(color);

    } catch (error) {
        console.log('[COLOR_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, colorId: string}}
) {
    try {
        const color = await handleProductRemoval(req, { storeId: params.storeId, productId: params.colorId }, "COLOR", prismadb.color, "colorId");


        return NextResponse.json(color);

    } catch (error) {
        console.log('[COLOR_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};