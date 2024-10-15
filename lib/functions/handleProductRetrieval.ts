import { updateProductPrice, updateProductsPrices } from '@/lib/functions/updateProductPrice';
import { getProduct, getProducts } from "../services/productService";

export async function handleProductRetrieval(productModel: any, productId?: string) {
    try {
        if (productId) {
            const product = await getProduct(productId, productModel);

            // Log the product to check if it's valid
            if (!product || Object.keys(product).length === 0) {
                console.error("No product found for ID:", productId);
                return {};
            }

            const updatedProduct = await updateProductPrice(product, productModel);
            return updatedProduct;
        } else {
            const products = await getProducts(productModel);

            // Validate products before updating
            const validatedProducts = await Promise.all(
                products.filter((product: any) => product && Object.keys(product).length > 0)
            );

            try {
                await updateProductsPrices(validatedProducts, productModel);
            } catch (error) {
                console.error("[BACKGROUND_UPDATE_ERROR]", error);
            }
            

            return validatedProducts;
        }
    } catch (error) {
        console.error("[PRODUCT_RETRIEVAL_ERROR]", error);
        throw new Error("Failed to retrieve product(s)");
    }
}
