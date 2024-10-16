import { updateProductsPrices } from "@/lib/functions/updateProductPrice";
import { NextResponse } from "next/server";

export default async function handler(req: Request, { params }: { params: { storeId: string } }) {
    
    if (!params.storeId) {
        return new NextResponse("Store ID is required", { status: 400 });
    }
    try {
        const productPrices = await updateProductsPrices();

        if (!productPrices) {
            return new NextResponse("Failed to update prices", { status: 500 });
        }

        return new NextResponse("Prices updated successfully", { status: 200 });
    } catch (error) {
        console.error('[UPDATE_PRICES_POST]', error);
        return new NextResponse ("Internal error", { status: 500 });
    }
};