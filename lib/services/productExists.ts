import { NextResponse } from "next/server";

export async function checkIfProductExists(productId: string, productModel: any) {
    try {
        const product = await productModel.findUnique({
            where: {
                id: productId,
            },
        });

        if (!product) {
            return new NextResponse("Product not found", { status: 404 });
        }

        return product;
    } catch (error) {
        console.error("Error checking if product exists:", error);
        return null;
    }
}