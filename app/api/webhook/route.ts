import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";
import { Resend } from "resend";
import { ConfirmationEmail } from "@/components/emails/orderConfirmation";
import { Decimal } from "decimal.js";
import { ErrorTemplate } from "@/components/emails/errorEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

async function updateUserDetails(order: any, addressComponents: any, phone: string) {
    if (order.userId) {
        await prismadb.user.update({
            where: { id: order.userId },
            data: {
                address: addressComponents.adres,
                city: addressComponents.city,
                postalCode: addressComponents.postalcode,
                country: addressComponents.country,
                phone: phone || '',
            },
        });
        return await prismadb.user.findUnique({ where: { id: order.userId } });
    }
    return null;
}

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (error: any) {
        console.error("Webhook signature verification failed", error);
        await resend.emails.send({
            from: 'MODEX <errors@modexgaming.com>',
            to: 'info@modexgaming.com',
            subject: 'Webhook Error',
            react: ErrorTemplate({
                error: JSON.stringify(error),
                errorCode: 400,
            }),
        });
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

    if (!addressComponents.adres || !addressComponents.city || !addressComponents.country || !addressComponents.postalcode || !session?.customer_email) {
        return new NextResponse("Invalid address", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const order = await prismadb.order.update({
            where: { id: session?.metadata?.orderId },
            data: {
                isPaid: true,
                address: addressComponents.adres,
                postalCode: addressComponents.postalcode,
                country: addressComponents.country,
                city: addressComponents.city,
                phone: session?.customer_details?.phone || '',
                orderStatus: 'Processed',
                paymentMethod: session?.payment_method_types?.[0] || '',
                email: session?.customer_email
            },
            include: { orderItems: true },
        });

        const user = await updateUserDetails(order, addressComponents, session?.customer_details?.phone || '');

        const computers = await prismadb.computer.findMany({
            where: { id: { in: order.orderItems.map((item) => item.computerId) } },
        });

        const totalPrice = computers.reduce((total, computer) => {
            const price = new Decimal(computer.price);
            return total.plus(price);
        }, new Decimal(0));

        const { error } = await resend.emails.send({
            from: 'MODEX <invoice@modexgaming.com>',
            to: [order.email, 'info@modexgaming.com'],
            subject: 'Order Confirmation',
            react: ConfirmationEmail({
                firstName: user?.firstName || '',
                address: order.address,
                orderId: order.id,
                products: computers,
                totalPrice: totalPrice.toNumber(),
            }),
        });

        if (error) {
            console.error("Error sending order confirmation email", error);
            await resend.emails.send({
                from: 'MODEX <errors@modexgaming.com>',
                to: 'info@modexgaming.com',
                subject: 'Error Sending Order Confirmation',
                react: ErrorTemplate({
                    error: JSON.stringify(error),
                    errorCode: 500,
                }),
            });
            return new NextResponse(null, { status: 400 });
        }

        return new NextResponse(null, { status: 200 });
    }

    return new NextResponse(null, { status: 400 });
}
