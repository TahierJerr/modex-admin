import axios from "axios";
import * as cheerio from 'cheerio';

export async function fetchPriceFromUrl(url: string) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        let productPrice = '';
        const priceSelectors = ['.pricecontainer', '.pricediv', '.price', 'price-tag'];

        for (const selector of priceSelectors) {
            const priceElement = $(selector).first();
            if (priceElement.length) {
                productPrice = priceElement.text().trim();
                break;
            }
        }

        productPrice = productPrice.replace('€', '').replace(',', '.').replace('-', '00');

        const numericPrice = parseFloat(productPrice);

        if (isNaN(numericPrice)) {
            throw new Error('Price not found');
        }

        return numericPrice;
    } catch (error) {
        console.error('[TRACK_PRICE]', error);
        throw new Error('Failed to track price');
    }
}