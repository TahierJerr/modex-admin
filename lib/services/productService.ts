import { fetchPriceFromUrl } from "../scraping/fetchPriceFromUrl";

import { NextResponse } from 'next/server';

export async function createProduct(productData: any, storeId: string, productModel: any) {
    let price = null;

    try {
        if (productData.priceTrackUrl) {
            price = await fetchPriceFromUrl(productData.priceTrackUrl);
        }

        const product = await productModel.create({
            data: {
                ...productData,
                storeId: storeId,
                price,
            },
        });

        return new NextResponse(product, { status: 201 });
    } catch (error) {
        console.error("Error creating product with price tracking:", error);
        return new NextResponse("Failed to create product. Please try again later.", { status: 500 });
    }
}

export async function deleteProduct(productId: string, productModel: any) {
    try {
        const product = await productModel.delete({
            where: {
                id: productId,
            },
        });

        return new NextResponse(product, { status: 200 });
    } catch (error) {
        console.error("Error deleting product:", error);
        return new NextResponse("Failed to delete product. Please try again later.", { status: 500 });
    }
}

export async function updateProduct(productId: string, productData: any, productModel: any, existingProduct: any) {
    try {
        let updatedData: any = { ...productData };

        if (productData.priceTrackUrl && productData.priceTrackUrl !== existingProduct.priceTrackUrl) {
            const newPrice = await fetchPriceFromUrl(productData.priceTrackUrl);

            updatedData.price = newPrice;
            updatedData.priceTrackUrl = productData.priceTrackUrl;
        } else {
            updatedData.price = existingProduct.price;
            updatedData.priceTrackUrl = existingProduct.priceTrackUrl;
        }

        const product = await productModel.update({
            where: {
                id: productId,
            },
            data: updatedData,
        });

        return product;
    } catch (error) {
        console.error("Error updating product:", error);
        throw new Error("Failed to update product. Please try again later.");
    }
}