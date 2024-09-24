import isToday from "@/lib/utils/istoday";
import { fetchPriceFromUrl } from "@/lib/scraping/fetchPriceFromUrl";
import ProductData from "@/types";

export async function updateProductPrice(product: any, productModel: any) {
    if (!product.priceTrackUrl) {
        return product;
    }
    
    if (!isToday(product.updatedAt)) {
        try {
            const priceData: ProductData = await fetchPriceFromUrl(product.priceTrackUrl);
            const newPrice = priceData.minPriceNumber;
    
            if (newPrice === product.price) {
                return product;
            }
    
            const updatedProduct = await productModel.update({
                where: {
                    id: product.id,
                },
                data: {
                    price: newPrice,
                },
            });
    
            return updatedProduct;
        } catch (error) {
            console.error("[PRICE_FETCH_ERROR_PRODUCT]", error);
            return new Error("Failed to update price");
        }
    }
}

