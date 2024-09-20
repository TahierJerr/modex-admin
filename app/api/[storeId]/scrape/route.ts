import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

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

        const { data } = await axios.get(url);

        const $ = cheerio.load(data);
        const productName = $('h1').text().trim();
        const productPrice = $('.pricecontainer').first().text().trim();

        if (!productName || !productPrice) {
            return new NextResponse("Unable to scrape product data", { status: 500 });
        }

        return NextResponse.json({
            name: productName,
            price: productPrice,
            url,
        });
    } catch (error) {
        console.error('[SCRAPE_GET]', error);
        return new NextResponse("Failed to scrape product data", { status: 500 });
    }
}
