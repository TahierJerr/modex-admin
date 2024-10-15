import isToday from "@/lib/utils/istoday";
import { fetchPriceFromUrl, fetchPricesFromUrls } from "@/lib/scraping/fetchPriceFromUrl";
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
            return new Error("Failed to update price"); // Return error
        }
    }

    return product; // Return the product if it was updated today
}

export async function updateProductPrices(products: any[], productModel: any) {
    const productsToUpdate = products.filter(product => {
        return product.priceTrackUrl && !isToday(product.updatedAt);
    });

    if (productsToUpdate.length === 0) {
        return products; // Return early if no products need updating
    }

    // Create fallback data for each product
    const fallbackDataList = productsToUpdate.map(product => ({
        productName: product.name || 'Unknown Product',
        minPriceNumber: product.price || 0,
        avgPriceNumber: product.price || 0,
        minPrice: `$${product.price || '0.00'}`,
        avgPrice: `$${product.price || '0.00'}`,
        productUrl: product.priceTrackUrl,
        productGraphData: [] // Default or empty graph data
    }));

    // Extract the URLs to fetch prices for
    const urls = productsToUpdate.map(product => product.priceTrackUrl);

    try {
        // Fetch the prices for all products in batches
        const priceDataList: ProductData[] = await fetchPricesFromUrls(urls, fallbackDataList);

        // Update the prices in the database
        const updatedProducts = await Promise.all(
            productsToUpdate.map(async (product, index) => {
                const priceData = priceDataList[index];
                const newPrice = priceData.minPriceNumber;

                if (newPrice !== product.price) {
                    // Update the product in the database if the price has changed
                    const updatedProduct = await productModel.update({
                        where: {
                            id: product.id,
                        },
                        data: {
                            price: newPrice,
                        },
                    });

                    return updatedProduct;
                }

                // If the price hasn't changed, return the product as is
                return product;
            })
        );

        return updatedProducts; // Return all updated products
    } catch (error) {
        console.error("[PRICE_FETCH_ERROR_PRODUCTS]", error);
        throw new Error("Failed to update product prices");
    }
}
