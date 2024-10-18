export const maxDuration = 60;

import { updateGraphicsCardPrices } from "@/lib/functions/updateProductPrice";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
    if (!params.storeId) {
        return new NextResponse("Store ID is required", { status: 400 });
    }

    const url = new URL(req.url);
    const skipDateCheck = url.searchParams.get('skipDateCheck') === 'true' ? true : false;

    try {
        const productPrices = await updateGraphicsCardPrices(params.storeId, skipDateCheck);
        if (!productPrices) {
            return new NextResponse("Failed to update prices", { status: 500 });
        }
        return new NextResponse("Prices updated successfully", { status: 200 });
    } catch (error) {
        console.error('[UPDATE_PRICES_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
