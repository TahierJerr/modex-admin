import { updateProductPrice, updateProductPrices } from '@/lib/functions/updateProductPrice';
import { getProduct, getProducts } from "../services/productService";

export async function handleProductRetrieval(productModel: any, productId?: string) {
    try {
        if (productId) {
            // Single product retrieval
            const product = await getProduct(productId, productModel);

            // Log the product to check if it's valid
            if (!product || Object.keys(product).length === 0) {
                console.error("No product found for ID:", productId);
                return {};
            }

            // Update a single product's price
            const updatedProduct = await updateProductPrice(product, productModel);
            return updatedProduct;
        } else {
            // Multiple products retrieval
            const products = await getProducts(productModel);

            // Log products to see if any are missing
            console.log("Fetched products:", products);

            // Filter valid products
            const validProducts = products.filter((product: any) => product && Object.keys(product).length > 0);

            if (validProducts.length === 0) {
                console.log("No valid products found for updating.");
                return [];
            }

            // Update prices for multiple products in a batch
            const updatedProducts = await updateProductPrices(validProducts, productModel);
            return updatedProducts;
        }
    } catch (error) {
        console.error("[PRODUCT_RETRIEVAL_ERROR]", error);
        throw new Error("Failed to retrieve product(s)");
    }
}
