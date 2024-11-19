export const maxDuration = 60;
import { ErrorTemplate } from "@/components/emails/errorEmail";
import { updatePrices } from "@/lib/functions/updateProductPrice";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
                return await updatePrices(params.storeId, skipDateCheck);
            default:
                await resend.emails.send({
                    from: 'MODEX <errors@modexgaming.com>',
                    to: 'info@modexgaming.com',
                    subject: 'Invalid product model',
                    react: ErrorTemplate({
                        error: 'Invalid product model',
                        errorCode: 400,
                        notes: JSON.stringify({ model }),
                    }),
                });
                throw new Error("Invalid product model");
        }
    };

    try {
        const productPrices = await updateModelPrices(productModel || 'all');

        if (!productPrices) {
            await resend.emails.send({
                from: 'MODEX <errors@modexgaming.com>',
                to: 'info@modexgaming.com',
                subject: 'Failed to update prices',
                react: ErrorTemplate({
                    error: 'Failed to update prices',
                    errorCode: 500,
                }),
            });
            return new NextResponse("Failed to update prices", { status: 500 });
        }

        return new NextResponse("Prices updated successfully", { status: 200 });
    } catch (error) {
        console.error('[UPDATE_PRICES_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
