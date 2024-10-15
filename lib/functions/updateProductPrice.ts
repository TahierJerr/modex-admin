import isToday from "@/lib/utils/istoday";
import { fetchPriceFromUrl } from "@/lib/scraping/fetchPriceFromUrl";
import ProductData from "@/types";

export async function updateProductPrice(product: any, productModel: any) {
    if (!product.priceTrackUrl) {
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
            const priceData: ProductData = await fetchPriceFromUrl(product.priceTrackUrl, fallbackData);
            const newPrice = priceData.minPriceNumber;

            if (newPrice === product.price) {
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

            return updatedProduct; // Return the updated product
        } catch (error) {
            console.error("[PRICE_FETCH_ERROR_PRODUCT]", error);
            return product; // Return the original product on error
        }
    }

    return product; // Return the product if it was updated today
}

export async function updateProductsPrices(products: any[], productModel: any) {
    if (!products || products.length === 0) {
        return []; // Return empty array if no products are provided
    }

    // Filter products that have not been updated today
    const productsToUpdate = products.filter((product) => !isToday(product.updatedAt));

    if (productsToUpdate.length === 0) {
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

    // Process each batch sequentially with delay
    for (const batch of batchedProducts) {
        const batchResults = await Promise.all(batch.map(async (product: any) => {
            try {
                return await updateProductPrice(product, productModel);
            } catch (error) {
                console.error("[BATCH_PRODUCT_UPDATE_ERROR]", error);
                return product; // Return the original product on error
            }
        }));

        updatedProducts.push(...batchResults);

        // Delay between batches to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }

    return updatedProducts; // Return the updated products
}
