export async function checkIfProductExists(productId: string, productModel: any) {
    try {
        const product = await productModel.findUnique({
            where: {
                id: productId,
            },
        });

        if (!product) {
            return null;
        }

        return product;
    } catch (error) {
        console.error("Error checking if product exists:", error);
        throw new Error("Internal Server Error");
    }
}