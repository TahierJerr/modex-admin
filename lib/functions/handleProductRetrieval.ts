import { updateProductPrice } from '@/lib/functions/updateProductPrice';
import { getProduct, getProducts } from "../services/productService";

export async function handleProductRetrieval(productModel: any, productId?: string) {
    try {
        if (productId) {
            const product = await getProduct(productId, productModel);
            const updatedProduct = await updateProductPrice(product, productModel);
            return updatedProduct;
        } else {
            const products = await getProducts(productModel);
            const updatedProducts = await Promise.all(products.map((product: any) => updateProductPrice(product, productModel)));
            return updatedProducts;
        }
    } catch (error) {
        console.error("[PRODUCT_RETRIEVAL_ERROR]", error);
        throw new Error("Failed to retrieve product(s)");
    }
}