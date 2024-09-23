import { NextResponse } from 'next/server';
import { checkIfAuthorized } from '@/lib/auth/authorization';
import { validateAndProcessRequest } from '@/lib/utils/requestUtils';
import { updateProduct } from '@/lib/services/productService';
import { checkIfProductExistsForModification } from '@/lib/services/productExists';

interface ProductData {
    priceTrackUrl?: string;
}

export async function handleProductModification<ProductDataType extends ProductData>(
    req: Request,
    params: { storeId: string; productId: string },
    schema: any,
    productType: string,
    productModel: any,
    productDataHandler: (data: ProductDataType) => Partial<ProductDataType>,
) {
    try {
        await checkIfAuthorized(params.storeId);

        const existingProduct = await checkIfProductExistsForModification(params.productId, productModel);

        if (!existingProduct) {
            return new NextResponse("Product not found", { status: 404 });
        }

        const productData = await validateAndProcessRequest({
            req,
            schema,
            handler: (data: ProductDataType) => productDataHandler(data),
        });

        const updatedProduct = await updateProduct(params.productId, productData, productModel, existingProduct);
        
        return updatedProduct;
    } catch (error) {
        console.error(`[${productType}_MODIFICATION]`, error);
        
        if (error === "Unauthorized") {
            return new Error(`Unauthorized ${error}`);
        } else {
            return new Error(`Internal error ${error}`);
        }
    }
}
