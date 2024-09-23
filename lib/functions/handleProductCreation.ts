import { NextResponse } from 'next/server';
import { checkIfAuthorized } from '@/lib/auth/authorization';
import { validateAndProcessRequest } from '@/lib/utils/requestUtils';
import { createProduct } from '@/lib/services/productService';

interface ProductData {
    priceTrackUrl?: string;
}

export async function handleProductCreation<ProductDataType extends ProductData>(
    req: Request,
    params: { storeId: string },
    schema: any,
    productType: string,
    productModel: any,
    productDataHandler: (data: ProductDataType) => Partial<ProductDataType>,
) {
    try {
        await checkIfAuthorized(params.storeId);
        
        const productData = await validateAndProcessRequest({
            req,
            schema,
            handler: (data: ProductDataType) => productDataHandler(data),
        });
        
        const product = await createProduct(productData, params.storeId, productModel);
        
        return product;
    } catch (error) {
        console.error(`[${productType}_POST_PRODUCT_CREATION]`, error);
        return new Error("Internal error");
    }
}