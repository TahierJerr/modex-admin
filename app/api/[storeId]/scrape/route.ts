import { NextResponse } from 'next/server';
import { fetchPriceFromUrl } from '@/lib/scraping/fetchPriceFromUrl';
import ProductData from '@/types';

export async function GET(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const url = searchParams.get('url');

        if (!url) {
            return new NextResponse("URL is required", { status: 400 });
        }

        const productData: ProductData = await fetchPriceFromUrl(url)

        return NextResponse.json({
            name: productData.minPrice,
            minPrice: productData.minPrice,
            avgPrice: productData.avgPrice,
            productUrl: productData.productUrl
        });
    } catch (error) {
        console.error('[SCRAPE_GET]', error);
        return new NextResponse("Failed to scrape product data", { status: 500 });
    }
}
