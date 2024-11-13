import { fetchPriceFromUrl } from "@/lib/scraping/fetchPriceFromUrl";

export async function createProduct(productData: any, storeId: string, productModel: any) {
    let price = null;

    try {
        if (productData.priceTrackUrl) {
            price = await fetchPriceFromUrl(productData.priceTrackUrl);
        }

        const newPrice = price?.minPriceNumber
        const productUrl = price?.productUrl

        const product = await productModel.create({
            data: {
                ...productData,
                storeId: storeId,
                price: newPrice,
                productUrl: productUrl,
            },
        });

        return product;  // Return the created product directly
    } catch (error) {
        console.error("Error creating product with price tracking:", error);
        throw new Error("Failed to create product. Please try again later.");  // Throw an error
    }
}

export async function deleteProduct(productId: string, productModel: any) {
    try {
        const product = await productModel.delete({
            where: {
                id: productId,
            },
        });

        return product; 
    } catch (error) {
        console.error("Error deleting product:", error);
        throw new Error("Failed to delete product. Please try again later.");  // Throw an error
    }
}


export async function updateProduct(productId: string, productData: any, productModel: any, existingProduct: any) {
    try {
        let updatedData: any = { ...productData };

        if (productData.priceTrackUrl && productData.priceTrackUrl !== existingProduct.priceTrackUrl) {
            const newPrice = await fetchPriceFromUrl(productData.priceTrackUrl);

            updatedData.price = newPrice.minPriceNumber;
            updatedData.priceTrackUrl = productData.priceTrackUrl;
            updatedData.productUrl = newPrice.productUrl;
        } else {
            updatedData.price = existingProduct.price;
            updatedData.priceTrackUrl = existingProduct.priceTrackUrl;
            updatedData.productUrl = existingProduct.productUrl;
        }

        console.log('Data to be updated in product:', updatedData);

        // Perform the update
        const product = await productModel.update({
            where: {
                id: productId,
            },
            data: updatedData,
        });

        console.log('Updated product data:', product);
        
        return product;
    } catch (error) {
        console.error("Error updating product:", error);
        throw new Error("Failed to update product. Please try again later.");
    }
}

export async function getProducts(productModel: any) {
    try {
        const products = await productModel.findMany();

        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw new Error("Failed to fetch products. Please try again later.");
    }
}

export async function getProduct(productId: string, productModel: any) {
    try {
        const product = await productModel.findUnique({
            where: {
                id: productId,
            },
        });

        return product;
    } catch (error) {
        console.error("Error fetching product:", error);
        throw new Error("Failed to fetch product. Please try again later.");
    }
}