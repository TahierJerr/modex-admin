import prismadb from "@/lib/prismadb";
import { auth } from '@clerk/nextjs/server';

export async function checkIfAuthorized(storeId: string) {
    const { userId } = auth();

    if (!userId) {
        throw new Error("Unauthenticated");
    }

    if (!storeId) {
        throw new Error("Store ID is required");
    }

    try {
        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: storeId,
                userId
            }
        });

        if (!storeByUserId) {
            throw new Error("Unauthorized");
        }

        return true; 
    } catch (error) {
        console.error("Database error:", error);
        throw new Error("Internal Server Error");
    }
}
