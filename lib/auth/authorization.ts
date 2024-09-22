import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/dist/types/server";
import { NextResponse } from "next/server";

export async function checkIfAuthorized(storeId: string) {
    const { userId } = auth();

    if (!userId) {
        return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!storeId) {
        return new NextResponse("Store ID is required", { status: 400 });
    }

    try {
        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        return new NextResponse("Authorized", { status: 200 });
    } catch (error) {
        console.error("Database error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
