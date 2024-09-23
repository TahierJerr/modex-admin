import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import formatPrice from '@/lib/utils/formatPrice';

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
        let productPrice = '';
        let productUrl = '';

        const priceElement = $('td.shop-price').first();
        if (priceElement.length) {
            productPrice = priceElement.text().trim();
        }

        const linkElement = priceElement.find('a');

        if (linkElement.length) {
            productUrl = linkElement.attr('href') || '';
        }
        

        const prices: number[] = [];
        $('.shop-price').each((index, element) => {
            const priceText = $(element).text().trim();
            const price = parseFloat(
                priceText
                    .replace(/€|\s/g, '')
                    .replace(/,/g, '.')
                    .replace(/-/g, '00')
            );
            if (!isNaN(price)) {
                prices.push(price);
            }
        });

        const productAvgPrice = prices.length
            ? (prices.reduce((sum, price) => sum + price, 0) / prices.length).toString()
            : parseFloat(productPrice).toString();

        if (!productName || !productPrice) {
            return new NextResponse("Unable to scrape product data", { status: 500 });
        }
        
        const formattedMinPrice = formatPrice(parseFloat(productPrice));
        const formattedAvgPrice = formatPrice(parseFloat(productAvgPrice));

        return NextResponse.json({
            name: productName,
            minPrice: formattedMinPrice,
            avgPrice: formattedAvgPrice,
            productUrl,
        });
    } catch (error) {
        console.error('[SCRAPE_GET]', error);
        return new NextResponse("Failed to scrape product data", { status: 500 });
    }
}
