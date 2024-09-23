import { checkIfProductExists } from "@/lib/services/productExists";
import { updateProductPrice } from '@/lib/functions/updateProductPrice';

export async function handleProductRetrieval(productId: string, productModel: any) {
    try {
        const product = await checkIfProductExists(productId, productModel);

        const updatedProduct = await updateProductPrice(product, productModel);

        return updatedProduct;
    } catch (error) {
        console.error("[PRODUCT_RETRIEVAL_ERROR]", error);
        throw new Error("Failed to retrieve product");
    }
}