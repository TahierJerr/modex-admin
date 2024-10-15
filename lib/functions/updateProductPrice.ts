import isToday from "@/lib/utils/istoday";
import { fetchPriceFromUrl } from "@/lib/scraping/fetchPriceFromUrl";
import ProductData from "@/types";

export async function updateProductPrice(product: any, productModel: any) {
    if (!product.priceTrackUrl) {
        console.log(`[${new Date().toISOString()}] No tracking URL for product ID: ${product.id}. Skipping update.`);
        return product; // Return if there's no tracking URL
    }

    if (!isToday(product.updatedAt)) {
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
            console.log(`[${new Date().toISOString()}] Fetching price data for product ID: ${product.id}`);
            const priceData: ProductData = await fetchPriceFromUrl(product.priceTrackUrl, fallbackData);
            const newPrice = priceData.minPriceNumber;

            console.log(`[${new Date().toISOString()}] Fetched price data for product ID: ${product.id}, New Price: ${newPrice}`);

            if (newPrice === product.price) {
                console.log(`[${new Date().toISOString()}] No change in price for product ID: ${product.id}.`);
                return product; // No change in price, return the product as is
            }

            // Update the product price in the database
            const updatedProduct = await productModel.update({
                where: {
                    id: product.id,
                },
                data: {
                    price: newPrice,
                },
            });

            console.log(`[${new Date().toISOString()}] Updated product ID: ${product.id} to new price: ${newPrice}`);
            return updatedProduct; // Return the updated product
        } catch (error) {
            console.error(`[PRICE_FETCH_ERROR_PRODUCT for product ID: ${product.id}]`, error);
            return product; // Return the original product on error
        }
    }

    console.log(`[${new Date().toISOString()}] Product ID: ${product.id} was updated today. Skipping update.`);
    return product; // Return the product if it was updated today
}


export async function updateProductsPrices(products: any[], productModel: any) {
    if (!products || products.length === 0) {
        console.log(`[${new Date().toISOString()}] No products provided. Exiting function.`);
        return [];
    }

    // Filter products that have not been updated today
    const productsToUpdate = products.filter((product) => !isToday(product.updatedAt));

    if (productsToUpdate.length === 0) {
        console.log(`[${new Date().toISOString()}] All products have been updated today. Exiting function.`);
        return products; // Return the products if all have been updated today
    }

    // Batch the products in groups of 5
    const batchedProducts = productsToUpdate.reduce((acc, product, index) => {
        const batchIndex = Math.floor(index / 5);
        acc[batchIndex] = [...(acc[batchIndex] || []), product];
        return acc;
    }, []);

    const delayBetweenBatches = 2000; // Delay between batches (2 seconds)
    const updatedProducts: any[] = [];

    console.log(`[${new Date().toISOString()}] Starting to process ${productsToUpdate.length} products in ${batchedProducts.length} batches.`);

    // Process each batch sequentially with delay
    for (const [batchIndex, batch] of batchedProducts.entries()) {
        console.log(`[${new Date().toISOString()}] Processing batch ${batchIndex + 1} of ${batchedProducts.length}.`);

        try {
            const batchResults = await Promise.all(batch.map(async (product: any) => {
                try {
                    console.log(`[${new Date().toISOString()}] Updating product ID: ${product.id}`);
                    const result = await updateProductPrice(product, productModel);
                    console.log(`[${new Date().toISOString()}] Successfully updated product ID: ${product.id}`);
                    return result;
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

    console.log(`[${new Date().toISOString()}] Finished processing all batches. Returning updated products.`);
    return updatedProducts; // Return the updated products
}