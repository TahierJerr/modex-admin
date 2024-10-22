export const maxDuration = 60;
import { updatePrices } from "@/lib/functions/updateProductPrice";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
    if (!params.storeId) {
        return new NextResponse("Store ID is required", { status: 400 });
    }

    const url = new URL(req.url);
    const skipDateCheck = url.searchParams.get('skipDateCheck') === 'true' ? true : false;
    const productModel = url.searchParams.get('productModel') || 'all';

    const updateModelPrices = async (model: string) => {
        switch (model) {
            case 'graphics':
                return await updatePrices(params.storeId, skipDateCheck, prismadb.graphics);
            case 'processor':
                return await updatePrices(params.storeId, skipDateCheck, prismadb.processor);
            case 'motherboard':
                return await updatePrices(params.storeId, skipDateCheck, prismadb.motherboard);
            case 'memory':
                return await updatePrices(params.storeId, skipDateCheck, prismadb.memory);
            case 'storage':
                return await updatePrices(params.storeId, skipDateCheck, prismadb.storage);
            case 'power':
                return await updatePrices(params.storeId, skipDateCheck, prismadb.power);
            case 'pccase':
                return await updatePrices(params.storeId, skipDateCheck, prismadb.pccase);
            case 'cooler':
                return await updatePrices(params.storeId, skipDateCheck, prismadb.cooler);
            case 'all':
                return {
                    graphics: await updatePrices(params.storeId, skipDateCheck, 'graphics'),
                    processor: await updatePrices(params.storeId, skipDateCheck, 'processor'),
                    motherboard: await updatePrices(params.storeId, skipDateCheck, 'motherboard'),
                    memory: await updatePrices(params.storeId, skipDateCheck, 'memory'),
                    storage: await updatePrices(params.storeId, skipDateCheck, 'storage'),
                    power: await updatePrices(params.storeId, skipDateCheck, 'power'),
                    pccase: await updatePrices(params.storeId, skipDateCheck, 'pccase'),
                    cooler: await updatePrices(params.storeId, skipDateCheck, 'cooler'),
                };
            default:
                throw new Error("Invalid product model");
        }
    };

    try {
        const productPrices = await updateModelPrices(productModel || 'all');

        if (!productPrices) {
            return new NextResponse("Failed to update prices", { status: 500 });
        }

        return new NextResponse("Prices updated successfully", { status: 200 });
    } catch (error) {
        console.error('[UPDATE_PRICES_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
