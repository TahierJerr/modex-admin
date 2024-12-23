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

        const existingProduct = await checkIfProductExistsForModification(productModel, params.productId);

        if (!existingProduct) {
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }

        const productData = await validateAndProcessRequest({
            req,
            schema,
            handler: (data: ProductDataType) => productDataHandler(data),
        });

        const updatedProduct = await updateProduct(params.productId, productData, productModel, existingProduct);
        
        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error(`[${productType}_MODIFICATION]`, error);
        
        if (error === "Unauthorized") {
            return NextResponse.json({ message: `Unauthorized ${error}` }, { status: 403 });
        } else {
            return NextResponse.json({ message: `Internal error: ${error}` }, { status: 500 });
        }
    }
}