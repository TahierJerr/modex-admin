import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import Navbar from "@/components/main-nav";

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { storeId: string };
}) {
    const { userId } = auth();

    if (!userId) {
        redirect("/sign-in");
    } 

    const store = await prismadb.store.findFirst({
        where: {
            id: params.storeId,
            userId
        },
    });

    const stores = await prismadb.store.findMany({
        where: {
            userId,
        },
    });

    if (!store) {
        redirect("/");
    }

    return (
        <>
        <Navbar stores={stores}  />
        <main>
            {children}
        </main>
        </>
    )
}