import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;
    
    let event: Stripe.Event;
    
    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }
    
    const session = event.data.object as Stripe.Checkout.Session;
    const address = session?.customer_details?.address;
    
    const addressComponents = [
        address?.line1,
        address?.city,
        address?.postal_code,
        address?.country,
    ];
    
    const addressString = addressComponents.filter((c) => c !== null).join(", ");
    
    if (event.type === "checkout.session.completed") {
        const order = await prismadb.order.update({
            where: {
                id: session?.metadata?.orderId,
            },
            data: {
                isPaid: true,
                address: addressString,
                phone: session?.customer_details?.phone || ''
            },
            include: {
                orderItems: true
            }
        });
        
        const computerIds = order.orderItems.map((orderItem) => orderItem.computerId);
        
        const computersToUpdate = await prismadb.computer.findMany({
            where: {
                id: {
                    in: [...computerIds],
                }
            }
        });
        
        const computersToArchive = computersToUpdate.filter(computer => !computer.isFeatured);
        
        const computersToArchiveIds = computersToArchive.map(computer => computer.id);
        
        await prismadb.computer.updateMany({
            where: {
                id: {
                    in: [...computersToArchiveIds],
                }
            },
            data: {
                isArchived: true
            }
        });
    }

    return new NextResponse(null, { status: 200 })
}