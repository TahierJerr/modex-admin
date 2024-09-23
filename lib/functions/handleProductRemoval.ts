import { checkIfAuthorized } from '@/lib/auth/authorization';
import { deleteProduct } from '@/lib/services/productService';

export async function handleProductRemoval(
    req: Request,
    params: { storeId: string, productId: string },
    productType: string,
    productModel: any,
) {
    try {
        await checkIfAuthorized(params.storeId);
        
        const product = await deleteProduct(params.productId, productModel);
        
        return product;
    } catch (error) {
        console.error(`[${productType}_POST_PRODUCT_CREATION]`, error);
        return new Error("Internal error");
    }
}