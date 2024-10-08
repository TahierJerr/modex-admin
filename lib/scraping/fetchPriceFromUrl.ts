import axios from "axios";
import * as cheerio from 'cheerio';
import { ProductGraphData } from "@/types";
import { fetchChartData } from "./fetchChartData";
import { extractName, extractPriceData, extractUri } from "./functions/extractData";
import { formatPrices } from "./functions/formatPrices";
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
    minTime: 100,
    maxConcurrent: 1
});

export async function fetchPriceFromUrl(url: string, fallbackData: any = null) {
    let retries = 3;

    while (retries > 0) {
        try {
            const { data } = await limiter.schedule(() => axios.get(url));
            console.log('Fetching data from:', url);

            const $ = cheerio.load(data);

            const { productPrice, productUrl } = extractPriceData($);

            // Check if productPrice is valid
            if (!productPrice) {
                throw new Error("Price not found.");
            }
            
            const productUri = extractUri($);
            const productName = extractName($);
            const productGraphData: ProductGraphData[] = await fetchChartData(productUri);

            const { minPriceNumber, avgPriceNumber, minPrice, avgPrice } = formatPrices(productPrice);

            return {
                productName,
                minPriceNumber,
                avgPriceNumber,
                minPrice,
                avgPrice,
                productUrl,
                productGraphData
            };

        } catch (error: any) {
            retries--;
            console.error('[TRACK_PRICE]', error);

            // Handling specific cases
            if (retries === 0 || error?.response?.status === 429) {
                console.log('Retries exhausted or rate limit hit. Returning fallback data.');

                if (fallbackData) {
                    return fallbackData;
                } else {
                    throw new Error('Failed to track price and no fallback data available.');
                }
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return fallbackData;
}