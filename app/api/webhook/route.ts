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

    const addressComponents = {
        adres: address?.line1,
        city: address?.city,
        postalcode: address?.postal_code,
        country: address?.country,
    };

    if (event.type === "checkout.session.completed") {
        const order = await prismadb.order.update({
            where: {
                id: session?.metadata?.orderId,
            },
            data: {
                isPaid: true,
                address: `${addressComponents.adres}, ${addressComponents.city}`,
                postalCode: addressComponents.postalcode ?? undefined,
                country: addressComponents.country ?? undefined,
                phone: session?.customer_details?.phone || '',
                orderStatus: 'Processed',
                paymentMethod: session?.payment_method_types?.[0] || '',
            },
            include: {
                orderItems: true,
            }
        });

        await prismadb.user.update({
            where: {
                id: order.userId,
            },
            data: {
                address: `${addressComponents.adres}, ${addressComponents.city}`,
                postalCode: addressComponents.postalcode ?? undefined,
                country: addressComponents.country ?? undefined,
                phone: session?.customer_details?.phone || '',
            }
        });

        return new NextResponse(null, { status: 200 });
    }

    return new NextResponse(null, { status: 400 });
}
