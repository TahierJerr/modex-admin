export async function checkIfProductExists(productId: string, productModel: any) {
    try {
        const product = await productModel.findUnique({
            where: {
                id: productId,
            },
        });

        if (!product) {
            return new Error("Product not found");
        }

        return product;
    } catch (error) {
        console.error("Error checking if product exists:", error);
        throw new Error("Internal Server Error");
    }
}
