import { checkIfProductExists } from "@/lib/services/productExists";
import { updateProductPrice } from '@/lib/functions/updateProductPrice';

export async function handleProductRetrieval(productModel: any, productId?: string) {
    try {
        if (productId) {
            const product = await checkIfProductExists(productId, productModel);
            const updatedProduct = await updateProductPrice(product, productModel);
            return updatedProduct;
        } else {
            const products = await productModel.findAll(); // Assuming productModel has a findAll method
            const updatedProducts = await Promise.all(products.map((product: any) => updateProductPrice(product, productModel)));
            return updatedProducts;
        }
    } catch (error) {
        console.error("[PRODUCT_RETRIEVAL_ERROR]", error);
        throw new Error("Failed to retrieve product(s)");
    }
}