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

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (error: any) {
        console.error(error);
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
                email: session?.customer_details?.email || '',
            },
            include: {
                orderItems: true,
            }
        });

        let user = null;

        // check if order is bought by a user
        if (order.userId) {
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
    
            user = await prismadb.user.findUnique({
                where: {
                    id: order.userId,
                },
            });
        }

        
        
        const computers = await prismadb.computer.findMany({
            where: {
                id: {
                    in: order.orderItems.map((item) => item.computerId),
                },
            },
        });

        const totalPrice = computers.reduce((total, computer) => {
            const price = new Decimal(computer.price);
            return total.plus(price);
        }, new Decimal(0));
        
        const { data, error } = await resend.emails.send({
            from: 'MODEX <invoice@modexgaming.com>',
            to: [order.email, 'info@modexgaming.com'],
            subject: 'Order Confirmation',
            react: ConfirmationEmail({
                firstName: user?.firstName || '',
                address: order.address,
                orderId: order.id,
                products: computers, // Use the fetched computers
                totalPrice: totalPrice.toNumber(), // Convert totalPrice to a number
            }),
        });

        if (error) {
            console.error(error);
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