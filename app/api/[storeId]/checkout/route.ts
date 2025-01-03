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

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
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

    // Ensure all computers exist
    if (computers.length !== computerIds.length) {
        return new NextResponse("Some products not found", { status: 404 });
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = computers.map(computer => ({
        quantity: 1,
        price_data: {
            currency: 'EUR',
            product_data: {
                name: computer.name,
            },
            unit_amount: Math.round(parseFloat(computer.price.toFixed(2)) * 100),
            tax_behavior: 'inclusive',
        }
    }));

    const totalPrice = computers.reduce((acc, computer) => acc + parseFloat(computer.price.toFixed(2)), 0);

    let user = null;
    if (userId) {
        user = await prismadb.user.findUnique({
            where: { id: userId }
        });
    }

    const order = await prismadb.order.create({
        data: {
            storeId: params.storeId,
            userId: userId ?? undefined,  // Only associate userId if it exists
            isPaid: false,
            orderItems: {
                create: computerIds.map((computerId: string) => ({
                    computer: { connect: { id: computerId } }
                }))
            },
            phone: user?.phone || "",  // Use default empty string if no user
            address: "",
            postalCode: "",
            country: "",
            email: user?.email || "",  // Use default empty string if no user
            orderStatus: "PENDING",
            paymentMethod: "",
            totalPrice: totalPrice,
        }
    });

    const origin = req.headers.get("origin");
    if (!origin) {
        return new NextResponse("Origin header is required", { status: 400 });
    }

    const success_url = `${origin}/cart?success=1`;
    const cancel_url = `${origin}/cart?canceled=1`;

    const session = await stripe.checkout.sessions.create({
        line_items,
        customer_email: user?.email,  // Only use email if user exists
        mode: 'payment',
        billing_address_collection: 'required',
        consent_collection: { terms_of_service: 'required' },
        shipping_address_collection: { allowed_countries: ['NL', 'BE', 'DE'] },
        phone_number_collection: { enabled: true },
        customer_creation: "always",
        success_url,
        cancel_url,
        metadata: { orderId: order.id }
    });

    return NextResponse.json({ url: session.url }, { headers: corsHeaders });
}
