import Stripe from "stripe";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
};

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    const { computerIds } = await req.json();

    if (!computerIds || computerIds.length === 0) {
        return new NextResponse("Product IDs are required", { status: 400 });
    }

    const computers = await prismadb.computer.findMany({
        where: {
            id: {
                in: computerIds
            }
        }
    });

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    computers.forEach(computer => {
        line_items.push({
            quantity: 1,
            price_data: {
                currency: 'EUR',
                product_data: {
                    name: computer.name,
                },
                unit_amount: computer.price.toNumber() * 100,
                tax_behavior: 'inclusive',
                
            }
        })
    });

    const order = await prismadb.order.create({
        data: {
            storeId: params.storeId,
            isPaid: false,
            orderItems: {
                create: computerIds.map((computerId: string) => ({
                    computer: {
                        connect: {
                            id: computerId
                        }
                    }
                }))
            }
        }
    });

    const session = await stripe.checkout.sessions.create({
        line_items,
        mode: 'payment',
        billing_address_collection: 'required',
        consent_collection: {
            terms_of_service: 'required',
        },
        shipping_address_collection: {
            allowed_countries: ['NL', 'BE'],
        },
        phone_number_collection: {
            enabled: true
        },
        customer_creation: "always",
        success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
        cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
        metadata: {
            orderId: order.id
        }
    });




    return NextResponse.json({ url: session.url }, {
        headers: corsHeaders
    });
}