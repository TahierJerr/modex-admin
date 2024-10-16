export const maxDuration = 60;

import { isSameDate } from "@/lib/utils/istoday";
import { fetchPriceFromUrl } from "@/lib/scraping/fetchPriceFromUrl";
import ProductData from "@/types";

export async function updateProductPrice(product: any, productModel: any) {
    if (!product.priceTrackUrl) {
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
export async function updateProductsPrices(products: any[], productModel: any) {
    if (!products || products.length === 0) {
        return [];
    }

    const parseDate = (dateString: string): Date => new Date(dateString);

    const today: Date = new Date();

    const productsToUpdate = products.filter((product) => !isSameDate(parseDate(product.updatedAt), today));

    if (productsToUpdate.length > 0) {
        const isProductUpdatedToday: boolean = isSameDate(parseDate(productsToUpdate[0].updatedAt), today);
        console.log(`UpdatedAt: ${productsToUpdate[0].updatedAt}, isToday: ${isProductUpdatedToday}`);
    } else {
        console.log('No products to update today.');
    }

    if (productsToUpdate.length === 0) {
        return products;
    }

    const batchedProducts = productsToUpdate.reduce((acc, product, index) => {
        const batchIndex = Math.floor(index / 5);
        acc[batchIndex] = [...(acc[batchIndex] || []), product];
        return acc;
    }, [] as any[][]);

    const delayBetweenBatches = 3000;
    const updatedProducts: any[] = [];

    for (const [batchIndex, batch] of batchedProducts.entries()) {
        try {
            const batchResults = await Promise.all(batch.map(async (product: any) => {
                try {
                    const result = await updateProductPrice(product, productModel);
                    return result;
                } catch (error) {
                    console.error(`[${new Date().toISOString()}] [PRODUCT_UPDATE_ERROR for product ID: ${product.id}]`, error);
                    return product;
                }
            }));

            updatedProducts.push(...batchResults);
        } catch (batchError) {
            console.error(`[${new Date().toISOString()}] [BATCH_ERROR for batch ${batchIndex + 1}]`, batchError);
        }

        await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }

    return updatedProducts;
}