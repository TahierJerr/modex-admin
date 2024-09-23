import axios from "axios";
import * as cheerio from 'cheerio';
import formatPrice from "../utils/formatPrice";
import { NextResponse } from "next/server";
import priceToNumber from "../utils/priceToNumber";

export async function fetchPriceFromUrl(url: string) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

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

        if (!productPrice) {
            return new NextResponse("Unable to scrape product data", { status: 500 });
        }
        
        const formattedMinPrice = formatPrice(parseFloat(productPrice));
        const formattedAvgPrice = formatPrice(parseFloat(productAvgPrice));

        const productData = {
            minPriceNumber: priceToNumber(productPrice),
            avgPriceNumber: priceToNumber(productAvgPrice),
            minPrice: formattedMinPrice,
            avgPrice: formattedAvgPrice,
            productUrl,
        };

        return NextResponse.json(productData); 
    } catch (error) {
        console.error('[TRACK_PRICE]', error);
        throw new NextResponse('Failed to track price', { status: 500 });
    }
}