import { auth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { z } from "zod";
import { handleProductRemoval } from "@/lib/functions/handleProductRemoval";
import { handleProductModification } from "@/lib/functions/handleProductModification";

export async function GET (
    req: Request,
    { params }: { params: { powerId: string}}
) {
    try {
        if (!params.powerId) {
            return new NextResponse("PSU ID is required", { status: 400 });
        }

        const power = await prismadb.power.findUnique({
            where: {
                id: params.powerId,
            }
        });

        return NextResponse.json(power);

    } catch (error) {
        console.log('[POWER_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

const powerSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    model: z.string().min(1, { message: "PSU model is required" }),
    wattage: z.string().min(1, { message: "PSU wattage is required" }),
    rating: z.string().min(1, { message: "PSU rating is required" }),
});

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, powerId: string}}
) {
    try {
        const updatedPower = await handleProductModification(req, { storeId: params.storeId, productId: params.powerId }, powerSchema, "POWER", prismadb.power, (data) => data);

        return NextResponse.json(updatedPower);

    } catch (error) {
        console.log('[POWER_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export async function DELETE (
    req: Request,
    { params }: { params: { storeId: string, powerId: string}}
) {
    try {
        const power = await handleProductRemoval(req, { storeId: params.storeId, productId: params.powerId }, "POWER", prismadb.power);


        return NextResponse.json(power);

    } catch (error) {
        console.log('[POWER_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};