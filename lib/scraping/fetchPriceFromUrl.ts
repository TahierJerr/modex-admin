import axios from "axios";
import * as cheerio from 'cheerio';
import { ProductGraphData } from "@/types";
import { fetchChartData } from "./fetchChartData";
import { extractName, extractPriceData, extractUri } from "./functions/extractData";
import { formatPrices } from "./functions/formatPrices";
import Bottleneck from 'bottleneck';

// Create a rate limiter to limit requests
const limiter = new Bottleneck({
    minTime: 2000, // 2 seconds between requests
    maxConcurrent: 1 // Process only one request at a time
});

// Fetch price from the given URL with retry logic and fallback to cached/default data
export async function fetchPriceFromUrl(url: string, fallbackData: any = null) {
    let retries = 3; // Set maximum retries
    while (retries > 0) {
        try {
            // Use the limiter to schedule the axios request
            const { data } = await limiter.schedule(() => axios.get(url));
            console.log(url);

            const $ = cheerio.load(data);

            // Extract the product data
            const { productPrice, productUrl } = extractPriceData($);
            const productUri = extractUri($);
            const productName = extractName($);

            // Fetch the product's historical graph data
            const productGraphData: ProductGraphData[] = await fetchChartData(productUri);

            // Format price data for display
            const { minPriceNumber, avgPriceNumber, minPrice, avgPrice } = formatPrices(productPrice);

            // Return the collected and formatted data
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

            // If the error is a 429 (too many requests) and retries exhausted, return fallback data
            if (retries === 0 || error?.response?.status === 429) {
                console.log('Retries exhausted or rate limit hit. Returning fallback data.');
                if (fallbackData) {
                    return fallbackData; // Return cached or default fallback data
                } else {
                    throw new Error('Failed to track price and no fallback data available.');
                }
            }
        }
    }
}
