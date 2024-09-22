import prismadb from "@/lib/prismadb";
import { fetchPriceFromUrl } from "../scraping/fetchPriceFromUrl";

import { NextResponse } from 'next/server';

export async function createProduct(productData: any, params: { storeId: string }, productType: string, productModel: any, withPriceTracking: boolean) {
    let price = null;

    try {
        if (withPriceTracking && productData.priceTrackUrl) {
            price = await fetchPriceFromUrl(productData.priceTrackUrl);
        }

        const product = await productModel.create({
            data: {
                ...productData,
                storeId: params.storeId,
                price,
            },
        });

        if (withPriceTracking && price && productData.priceTrackUrl) {
            await prismadb.priceTracking.create({
                data: {
                    price,
                    priceTrackUrl: productData.priceTrackUrl,
                    productId: product.id,
                    productType,
                },
            });
        }

        return new NextResponse(product, { status: 201 });
    } catch (error) {
        console.error("Error creating product with price tracking:", error);
        return new NextResponse("Failed to create product. Please try again later.", { status: 500 });
    }
}
