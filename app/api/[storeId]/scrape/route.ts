import { NextResponse } from 'next/server';
import { fetchPriceFromUrl } from '@/lib/scraping/fetchPriceFromUrl';
import ProductData, { ProductGraphData } from '@/types';
import { fetchChartData } from '@/lib/scraping/fetchChartData';

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
        const uri = searchParams.get('uri');

        if (!url || !uri) {
            return new NextResponse("URL and URI are required", { status: 400 });
        }

        const productData: ProductData = await fetchPriceFromUrl(url)

        const productGraphData: ProductGraphData[] = await fetchChartData(uri); 

        return NextResponse.json({
            productData,
            productGraphData,
        });
    } catch (error) {
        console.error('[SCRAPE_GET]', error);
        return new NextResponse("Failed to scrape product data", { status: 500 });
    }
}
