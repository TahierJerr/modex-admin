import axios from "axios";
import * as cheerio from 'cheerio';
import formatPrice from "../utils/formatPrice";
import priceToNumber from "../utils/priceToNumber";

interface ProductData {
    minPriceNumber: number;
    avgPriceNumber: number;
    minPrice: string;
    avgPrice: string;
    productUrl: string;
}

export async function fetchPriceFromUrl(url: string): Promise<ProductData> {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        let productPrice = '';
        let productUrl = '';
        const prices: number[] = [];

        $('.shop-listing tr').each((index, element) => {
            const priceElement = $(element).find('td.shop-price').first();
            const deliveryElement = $(element).find('td.shop-delivery').first();
            
            const priceText = priceElement.text().trim();
            const price = parseFloat(
                priceText
                    .replace(/€|\s/g, '')
                    .replace(/,/g, '.')
                    .replace(/-/g, '00')
            );

            const deliveryText = deliveryElement.text().trim().toLowerCase();

            if (!isNaN(price) && deliveryText.includes("morgen")) {
                prices.push(price);

                if (!productPrice) {
                    productPrice = priceText;
                    const linkElement = priceElement.find('a');
                    if (linkElement.length) {
                        productUrl = linkElement.attr('href') || '';
                    }
                }
            }
        });

        const productAvgPrice = prices.length
            ? (prices.reduce((sum, price) => sum + price, 0) / prices.length).toString()
            : parseFloat(productPrice).toString();

        if (!productPrice) {
            throw new Error("Unable to scrape product data with valid delivery time");
        }

        const formattedMinPrice = formatPrice(priceToNumber(productPrice));
        const formattedAvgPrice = formatPrice(priceToNumber(productAvgPrice));

        const productData: ProductData = {
            minPriceNumber: priceToNumber(productPrice),
            avgPriceNumber: priceToNumber(productAvgPrice),
            minPrice: formattedMinPrice,
            avgPrice: formattedAvgPrice,
            productUrl,
        };

        return productData;
    } catch (error) {
        console.error('[TRACK_PRICE]', error);
        throw new Error('Failed to track price');
    }
}
