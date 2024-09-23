import { NextResponse } from 'next/server';
import { checkIfAuthorized } from '@/lib/auth/authorization';
import { validateAndProcessRequest } from '@/lib/utils/requestUtils';
import { checkIfProductExists, updateProduct } from '@/lib/services/productService';

interface ProductData {
    priceTrackUrl?: string;
}

export async function handleProductModification<ProductDataType extends ProductData>(
    req: Request,
    params: { storeId: string, productId: string },
    schema: any,
    productType: string,
    productModel: any,
    productDataHandler: (data: ProductDataType) => Partial<ProductDataType>,
) {
    try {
        const authResponse = await checkIfAuthorized(params.storeId);
        
        if (authResponse) {
            return authResponse;
        }

        const existingProduct = await checkIfProductExists(params.productId, productModel);
        
        const productData = await validateAndProcessRequest({
            req,
            schema,
            handler: (data: ProductDataType) => productDataHandler(data),
        });
        
        const product = await updateProduct(params.productId, productData, productModel, existingProduct);
        
        return NextResponse.json(product);
    } catch (error) {
        console.error(`[${productType}_POST_PRODUCT_CREATION]`, error);
        return new NextResponse("Internal error", { status: 500 });
    }
}