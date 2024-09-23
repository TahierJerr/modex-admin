export async function checkIfProductExists(productModel: any, productId?: string) {
    try {
        if (productId) {
            const product = await productModel.findUnique({
                where: {
                    id: productId,
                },
            });

            if (!product) {
                return new Error("Product not found");
            }

            return product;
        } else {
            const products = await productModel.findMany();

            if (products.length === 0) {
                return new Error("No products found");
            }

            return products;
        }
    } catch (error) {
        console.error("Error checking if product exists:", error);
        throw new Error("Internal Server Error");
    }
}
