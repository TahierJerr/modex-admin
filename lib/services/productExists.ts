export async function checkIfProductExists(productId: string, productModel: any) {
    try {
        const product = await productModel.findUnique({
            where: {
                id: productId,
            },
        });

        if (!product) {
            throw new Error("Product not found");  // Throw an error if the product is not found
        }

        return product;  // Return the found product
    } catch (error) {
        console.error("Error checking if product exists:", error);
        throw new Error("Internal Server Error");  // Throw an error for unexpected issues
    }
}
