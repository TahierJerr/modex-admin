import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";
import { handleProductRemoval } from "@/lib/functions/handleProductRemoval";
import { handleProductModification } from "@/lib/functions/handleProductModification";

export async function GET (
    req: Request,
    { params }: { params: { softwareId: string}}
) {
    try {
        if (!params.softwareId) {
            return new NextResponse("Software ID is required", { status: 400 });
        }

        const software = await prismadb.software.findUnique({
            where: {
                id: params.softwareId,
            }
        });

        return NextResponse.json(software);

    } catch (error) {
        console.log('[SOFTWARE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

const softwareSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
});

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, softwareId: string}}
) {
    try {
        const updatedSoftware = await handleProductModification(req, { storeId: params.storeId, productId: params.softwareId }, softwareSchema, "SOFTWARE", prismadb.software, (data) => data);

        return NextResponse.json(updatedSoftware);

    } catch (error) {
        console.log('[SOFTWARE_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, softwareId: string}}
) {
    try {
        const software = await handleProductRemoval(req, { storeId: params.storeId, productId: params.softwareId }, "SOFTWARE", prismadb.software, "softwareId");


        return NextResponse.json(software);

    } catch (error) {
        console.log('[SOFTWARE_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};