export const maxDuration = 60;

import { isSameDate } from "@/lib/utils/istoday";
import { fetchPriceFromUrl } from "@/lib/scraping/fetchPriceFromUrl";
import ProductData from "@/types";

export async function updateProductPrice(product: any, productModel: any) {
    if (!product.priceTrackUrl) {
        return product; // Return if there's no tracking URL
    }
    
    try {
        // Set fallback data to return if the fetch fails
        const fallbackData = {
            productName: product.name || 'Unknown Product',
            minPriceNumber: product.price || 0,
            avgPriceNumber: product.price || 0,
            minPrice: `$${product.price || '0.00'}`,
            avgPrice: `$${product.price || '0.00'}`,
            productUrl: product.priceTrackUrl,
            productGraphData: [] // Default or empty graph data
        };
        
        // Fetch the latest price data from the URL, using fallback if necessary
        const priceData: ProductData = await fetchPriceFromUrl(product.priceTrackUrl, fallbackData);
        const newPrice = priceData.minPriceNumber;
        
        // Update the product price in the database
        const updatedProduct = await productModel.update({
            where: {
                id: product.id,
            },
            data: {
                price: newPrice,
            },
        });
        
        return updatedProduct; // Return the updated product
    } catch (error) {
        console.error(`[PRICE_FETCH_ERROR_PRODUCT for product ID: ${product.id}]`, error);
        return product; // Return the original product on error
    }
}


export async function updateProductsPrices(products: any[], productModel: any) {
    // Check if products array is empty
    if (!products || products.length === 0) {
        return [];
    }

    // Helper function to parse date strings into Date objects
    const parseDate = (dateString: string): Date => new Date(dateString);

    const today: Date = new Date();

    // Filter products that have not been updated today
    const productsToUpdate = products.filter((product) => !isSameDate(parseDate(product.updatedAt), today));

    // Log updatedAt date and isToday result
    if (productsToUpdate.length > 0) {
        const isProductUpdatedToday: boolean = isSameDate(parseDate(productsToUpdate[0].updatedAt), today);
        console.log(`UpdatedAt: ${productsToUpdate[0].updatedAt}, isToday: ${isProductUpdatedToday}`);
    } else {
        console.log('No products to update today.');
    }

    // Return original products if all have been updated today
    if (productsToUpdate.length === 0) {
        return products;
    }

    // Batch the products into groups of 5
    const batchedProducts = productsToUpdate.reduce((acc, product, index) => {
        const batchIndex = Math.floor(index / 5);
        acc[batchIndex] = [...(acc[batchIndex] || []), product];
        return acc;
    }, [] as any[][]); // Type as an array of arrays for better type inference

    const delayBetweenBatches = 3000; // Delay between batches (3 seconds)
    const updatedProducts: any[] = [];

    // Process each batch sequentially with delay
    for (const [batchIndex, batch] of batchedProducts.entries()) {
        try {
            const batchResults = await Promise.all(batch.map(async (product: any) => {
                try {
                    const result = await updateProductPrice(product, productModel);
                    return result; // Return updated product
                } catch (error) {
                    console.error(`[${new Date().toISOString()}] [PRODUCT_UPDATE_ERROR for product ID: ${product.id}]`, error);
                    return product; // Return the original product on error to keep the flow
                }
            }));

            updatedProducts.push(...batchResults);
        } catch (batchError) {
            console.error(`[${new Date().toISOString()}] [BATCH_ERROR for batch ${batchIndex + 1}]`, batchError);
        }

        // Delay between batches to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }

    return updatedProducts; // Return the updated products
}