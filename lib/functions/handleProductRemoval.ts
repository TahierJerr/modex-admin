import { NextResponse } from 'next/server';
import { checkIfAuthorized } from '../auth/authorization';
import { deleteProduct } from '../services/productService';


export async function handleProductRemoval(
    req: Request,
    params: { storeId: string, productId: string },
    productType: string,
    productModel: any,
) {
    try {
        const authResponse = await checkIfAuthorized(params.storeId);
        
        if (authResponse) {
            return authResponse;
        }
        
        const product = await deleteProduct(params.productId, productModel);
        
        return NextResponse.json(product);
    } catch (error) {
        console.error(`[${productType}_POST_PRODUCT_CREATION]`, error);
        return new NextResponse("Internal error", { status: 500 });
    }
}