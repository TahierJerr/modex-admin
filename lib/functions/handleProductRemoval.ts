import { checkIfAuthorized } from '@/lib/auth/authorization';
import { deleteProduct } from '@/lib/services/productService';
import prismadb from '../prismadb';

export async function handleProductRemoval(
    req: Request,
    params: { storeId: string, productId: string },
    productType: string,
    productModel: any,
    checkIfProductIsUsed?: string,
) {
    try {
        await checkIfAuthorized(params.storeId);

        if (checkIfProductIsUsed) {
            const isUsed = await prismadb.computer.findFirst({
                where: {
                    [checkIfProductIsUsed]: params.productId
                }
            })

            if (isUsed) {
                return new Error("Product is used in a computer");
            }
        }
        
        const product = await deleteProduct(params.productId, productModel);
        
        return product;
    } catch (error) {
        console.error(`[${productType}_POST_PRODUCT_CREATION]`, error);
        return new Error("Internal error");
    }
}