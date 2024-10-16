export const maxDuration = 60;

import { isSameDate } from "@/lib/utils/istoday";
import { fetchPriceFromUrl } from "@/lib/scraping/fetchPriceFromUrl";
import ProductData from "@/types";
import prismadb from "../prismadb";

export async function updateProductPrice(product: any, productModel: any) {
    if (!product.priceTrackUrl) {
        return product;
    }

    const today: Date = new Date();

    if (!isSameDate(product.updatedAt, today)) {
        return product;
    }
    
    try {
        const fallbackData = {
            productName: product.name || 'Unknown Product',
            minPriceNumber: product.price || 0,
            avgPriceNumber: product.price || 0,
            minPrice: `$${product.price || '0.00'}`,
            avgPrice: `$${product.price || '0.00'}`,
            productUrl: product.priceTrackUrl,
            productGraphData: [],
        };
        
        const priceData: ProductData = await fetchPriceFromUrl(product.priceTrackUrl, fallbackData);
        const newPrice = priceData.minPriceNumber;

        if (priceData.error) {
            console.error(`[PRICE_FETCH_ERROR_PRODUCT for product ID: ${product.id}]`, 'Failed to fetch price data.');
            return product;
        }
        
        const updatedProduct = await productModel.update({
            where: {
                id: product.id,
            },
            data: {
                price: newPrice,
            },
        });
        
        return updatedProduct;
    } catch (error) {
        console.error(`[PRICE_FETCH_ERROR_PRODUCT for product ID: ${product.id}]`, error);
        return product;
    }
}

// create cron job
export async function updateGraphicsCardPrices(params: string) {

    const products = await prismadb.graphics.findMany({
        where: {
            storeId: params,
        },
        select: {
            id: true,
            name: true,
            price: true,
            priceTrackUrl: true,
            updatedAt: true,
        },
    });

    const today: Date = new Date();
    const productsToUpdate = products.filter((product) => !isSameDate(product.updatedAt, today));

    if (productsToUpdate.length === 0) {
        return { updatedProducts: [], notUpdatedProducts: [] };
    }

    const batchedProducts = productsToUpdate.reduce((acc, product, index) => {
        const batchIndex = Math.floor(index / 5);
        acc[batchIndex] = [...(acc[batchIndex] || []), product];
        return acc;
    }, [] as any[][]);

    const delayBetweenBatches = 3000;
    const updatedProducts: any[] = [];
    const notUpdatedProducts: any[] = [];

    const timeout = 59000; // 59 seconds
    const startTime = Date.now();

    for (const [batchIndex, batch] of batchedProducts.entries()) {
        const remainingTime = timeout - (Date.now() - startTime);

        if (remainingTime <= 0) {
            notUpdatedProducts.push(...batch);
            break;
        }

        try {
            const batchResults = await Promise.race<Promise<any>[] | Promise<any>>([
                Promise.all(batch.map(async (product: any) => {
                    try {
                        const result = await updateProductPrice(product, product.productModel);
                        return result;
                    } catch (error) {
                        console.error(`[${new Date().toISOString()}] [PRODUCT_UPDATE_ERROR for product ID: ${product.id}]`, error);
                        notUpdatedProducts.push(product);
                        return null;
                    }
                })),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), remainingTime))
            ]);

            if (Array.isArray(batchResults)) {
                updatedProducts.push(...batchResults.filter(Boolean));
            }
        } catch (batchError) {
            console.error(`[${new Date().toISOString()}] [BATCH_ERROR for batch ${batchIndex + 1}]`, batchError);
            notUpdatedProducts.push(...batch);
        }

        await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }

    console.log("Updated Products:", updatedProducts);
    console.log("Products Not Updated On Time:", notUpdatedProducts);

    return updatedProducts;
}
