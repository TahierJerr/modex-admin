import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import Navbar from "@/components/navbar";

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
    } else if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }

    const store = await prismadb.store.findFirst({
        where: {
            id: params.storeId,
            userId
        },
    });

    if (!store) {
        redirect("/");
    }

    return (
        <>
        <Navbar />
        {children}
        </>
    )
}