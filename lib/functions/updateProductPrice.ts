export const maxDuration = 60;

import { fetchPriceFromUrl } from "@/lib/scraping/fetchPriceFromUrl";
import ProductData from "@/types";
import prismadb from "../prismadb";

const today: Date = new Date();


export async function updateProductPrice(product: any, productModel: any) {
    if (!product.priceTrackUrl) {
        return product;
    }

    const productDate = new Date(product.updatedAt);
    const todayString = today.toISOString().split('T')[0];
    const productDateString = productDate.toISOString().split('T')[0];

    if (productDateString === todayString) {
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
    console.log("Starting updateGraphicsCardPrices with params:", params);

    const products = await prismadb.graphics.findMany({
        where: { storeId: params },
        select: { id: true, name: true, price: true, priceTrackUrl: true, updatedAt: true },
    });
    console.log("Retrieved products:", products);

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    console.log("Today's date:", todayString);

    const productsToUpdate = products.filter((product) => {
        const productDate = new Date(product.updatedAt).toISOString().split('T')[0];
        return productDate !== todayString;
    });
    console.log("Products to update:", productsToUpdate);

    if (productsToUpdate.length === 0) {
        console.log("No products to update today.");
        return { updatedProducts: [], notUpdatedProducts: [] };
    }

    const batchedProducts = productsToUpdate.reduce((acc, product, index) => {
        const batchIndex = Math.floor(index / 5);
        acc[batchIndex] = [...(acc[batchIndex] || []), product];
        return acc;
    }, [] as any[][]);
    console.log("Batched products:", batchedProducts);

    const delayBetweenBatches = 100;
    const updatedProducts: any[] = [];
    const notUpdatedProducts: any[] = [];
    const timeout = 57000; // 59 seconds
    const startTime = Date.now();
    console.log("Start time:", startTime);

    for (const [batchIndex, batch] of batchedProducts.entries()) {
        const remainingTime = timeout - (Date.now() - startTime);
        console.log(`Batch ${batchIndex + 1}: Remaining time:`, remainingTime);

        if (remainingTime <= 0) {
            notUpdatedProducts.push(...batch);
            console.log(`Batch ${batchIndex + 1} not updated due to timeout:`, batch);
            break;
        }

        try {
            const batchResults = await Promise.race<Promise<any>[] | Promise<any>>([
                Promise.all(batch.map(async (product: any) => {
                    try {
                        const result = await updateProductPrice(product, product.productModel);
                        console.log(`[${new Date().toISOString()}] Product ID: ${product.id} updated successfully.`);
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

            console.log(`Batch ${batchIndex + 1} completed:`, batch);

        } catch (batchError) {
            console.error(`[${new Date().toISOString()}] [BATCH_ERROR for batch ${batchIndex + 1}]`, batchError);
            notUpdatedProducts.push(...batch);
        }

        await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }

    console.log("Updated Products:", updatedProducts);
    console.log("Products Not Updated On Time:", notUpdatedProducts);

    return { updatedProducts, notUpdatedProducts };
}
