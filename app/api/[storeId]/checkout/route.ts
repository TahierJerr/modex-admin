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
}

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    const { computerIds } = await req.json();

    if (!computerIds || computerIds.length === 0) {
        return new NextResponse("Product IDs are required", { status: 400 });
    }

    // Fetch computers by IDs from the database
    const computers = await prismadb.computer.findMany({
        where: {
            id: {
                in: computerIds,
            },
        },
    });

    // Prepare line items for Stripe checkout session
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = computers.map(computer => ({
        quantity: 1,
        price_data: {
            currency: 'EUR',
            product_data: {
                name: computer.name,
            },
            unit_amount: computer.price.toNumber() * 100, // Convert price to cents
            tax_behavior: 'inclusive',
        },
    }));

    // Create the order in the database
    const order = await prismadb.order.create({
        data: {
            storeId: params.storeId,
            isPaid: false,
            orderItems: {
                create: computerIds.map((computerId: string) => ({
                    computer: {
                        connect: {
                            id: computerId,
                        },
                    },
                })),
            },
        },
    });

    // Get the referer header
    const referer = req.headers.get("referer");

    // Generate success and cancel URLs based on referer
    const success_url = referer?.includes(".nl")
        ? `${process.env.FRONTEND_STORE1_URL}/cart?success=1`
        : `${process.env.FRONTEND_STORE2_URL}/cart?success=1` || `${process.env.FRONTEND_STORE_DEFAULT_URL}/cart?success=1`;

    const cancel_url = referer?.includes(".nl")
        ? `${process.env.FRONTEND_STORE1_URL}/cart?canceled=1`
        : `${process.env.FRONTEND_STORE2_URL}/cart?canceled=1` || `${process.env.FRONTEND_STORE_DEFAULT_URL}/cart?canceled=1`;

    try {
        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: "payment",
            billing_address_collection: "required",
            consent_collection: {
                terms_of_service: "required",
            },
            shipping_address_collection: {
                allowed_countries: ["NL", "BE"],
            },
            phone_number_collection: {
                enabled: true,
            },
            customer_creation: "always",
            success_url: success_url,
            cancel_url: cancel_url,
            metadata: {
                orderId: order.id,
            },
        });

        // Return the Stripe session URL
        return NextResponse.json({ url: session.url }, { headers: corsHeaders });
    } catch (error) {
        return new NextResponse(`Error creating Stripe session: ${error}`, { status: 500 });
    }
}
