export const maxDuration = 60;

import { fetchPriceFromUrl } from "@/lib/scraping/fetchPriceFromUrl";
import ProductData from "@/types";
import prismadb from "../prismadb";

export async function updateProductPrice(product: any, productModel: any) {
    if (!product.priceTrackUrl) {
        return product;
    }

    console.log(`Starting update for product ID: ${product.id}`);

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

        console.log(`Fetching price data from URL: ${product.priceTrackUrl}`);
        const priceData: ProductData = await fetchPriceFromUrl(product.priceTrackUrl, fallbackData);
        console.log(`Price data fetched: ${JSON.stringify(priceData)}`);
        
        const newPrice = priceData.minPriceNumber;

        if (priceData.error) {
            console.error(`[PRICE_FETCH_ERROR_PRODUCT for product ID: ${product.id}] Failed to fetch price data.`);
            return product;
        }

        console.log(`Updating product in database: ${product.id}`);
        const updatedProduct = await productModel.update({
            where: { id: product.id },
            data: { price: newPrice },
        });
        
        console.log(`Product ID: ${product.id} updated successfully.`);

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

    let updatedProducts: any[] = [];
    let notUpdatedProducts: any[] = [];
    const timeout = 55000; // 55 seconds to give some buffer
    const startTime = Date.now();

    const processProduct = async (product: any) => {
        try {
            const productStartTime = Date.now();
            const productRemainingTime = timeout - (Date.now() - startTime);
                
            if (productRemainingTime <= 0) {
                notUpdatedProducts.push(product);
                console.log(`Product ID: ${product.id} not updated due to timeout.`);
                return;
            }

            const result = await Promise.race([
                updateProductPrice(product, prismadb.graphics),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Product Timeout")), productRemainingTime))
            ]);
                    
            const productEndTime = Date.now();
            console.log(`[${new Date().toISOString()}] Product ID: ${product.id} updated successfully in ${productEndTime - productStartTime} ms.`);
            updatedProducts.push(result);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] [PRODUCT_UPDATE_ERROR for product ID: ${product.id}]`, error);
            notUpdatedProducts.push(product);
        }
    };

    for (let i = 0; i < productsToUpdate.length; i++) {
        await processProduct(productsToUpdate[i]);

        if ((i + 1) % 5 === 0) {
            const batchRemainingTime = timeout - (Date.now() - startTime);
            console.log(`Remaining time after batch ${Math.floor(i / 5) + 1}: ${batchRemainingTime}`);

            if (batchRemainingTime <= 0) {
                console.log("Timeout reached, committing updates and stopping.");
                break;
            }
            
            console.log(`Committing updates for products:`, updatedProducts);
            updatedProducts = []; // Reset after committing
            await new Promise(resolve => setTimeout(resolve, 3000)); // Rest for 3 seconds before continuing
        }
    }

    console.log("Updated Products:", updatedProducts);
    console.log("Products Not Updated On Time:", notUpdatedProducts);

    return { updatedProducts, notUpdatedProducts };
}
