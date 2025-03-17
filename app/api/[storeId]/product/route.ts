import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import { productSchema } from "@/lib/schemas/productSchema";
import { auth } from "@clerk/nextjs/dist/types/server";

export async function POST(
    req: NextRequest,
    { params }: { params: { storeId: string }}
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 })
        }

        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400})
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const body = await req.json();

        const validation = productSchema.safeParse(body)

        if (!validation.success) {
            return new NextResponse(validation.error.message, { status: 400 })
        }

        const { name, description, price, productUrl, images, isArchived, isFeatured, mainImage, specifications, variants, categoryId, parentProductId } = validation.data

        const product = await prismadb.product.create({
            data: {
                name,
                description,
                price,
                productUrl,
                mainImage,
                isFeatured,
                isArchived,
                storeId: params.storeId,
                ...(categoryId && { categoryId }),
                ...(parentProductId && { parentProductId }),
                ...(variants && variants.length > 0 && {
                    variants: {
                        createMany: {
                            data: variants.map(variant => ({
                                variantName: variant.name,
                                price: variant.price
                            }))
                        }
                    }
                }),
                ...(specifications && specifications.length > 0 && {
                    specifications: {
                        createMany: {
                            data: specifications.map(spec => ({
                                name: spec.name,
                                value: spec.value
                            }))
                        }
                    }
                }),
                ...(images && images.length > 0 && {
                    images: {
                        createMany: {
                            data: images.map(image => ({
                                url: image.url,
                                alt: image.alt || ''
                            }))
                        }
                    }
                })
            }
        });

        return NextResponse.json(product, { status: 201 });
        
    } catch (error) {
        console.log('[PRODUCTS_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { storeId: string }}
) {
    try {
        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const products = await prismadb.product.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(products);
    } catch (error) {
        console.log('[PRODUCTS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};