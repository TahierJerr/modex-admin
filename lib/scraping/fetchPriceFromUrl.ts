import axios from "axios";
import * as cheerio from 'cheerio';
import { ProductGraphData } from "@/types";
import { fetchChartData } from "./fetchChartData";
import { extractName, extractPriceData, extractUri } from "./functions/tweakers/extractData";
import { formatPrices } from "./functions/formatPrices";
import Bottleneck from 'bottleneck';

// Rate limiting using Bottleneck
const limiter = new Bottleneck({
    minTime: 100, // Delay between requests (adjust as needed)
    maxConcurrent: 1 // Maximum concurrent requests
});

// Helper function for adding a delay
async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchPriceFromUrl(url: string, fallbackData: any = null) {
    if (!url.startsWith("https://tweakers.net")) {
        console.log(`Skipping fetch for URL: ${url} (not a valid Tweakers.net URL)`);
        return fallbackData;
    }

    let retries = 3;

    while (retries > 0) {
        try {
            // Schedule requests with rate limiting
            const { data } = await limiter.schedule(() => axios.get(url));
            console.log('Fetching data from:', url);

            const $ = cheerio.load(data);
            const { productPrice, productUrl } = extractPriceData($);

            if (!productPrice) {
                throw new Error("Price not found.");
            }

            const productUri = extractUri($);
            const productName = extractName($);
            const { minPriceNumber, avgPriceNumber, minPrice, avgPrice } = formatPrices(productPrice);

            if (!productUri) {
                return {
                    productName,
                    minPriceNumber,
                    avgPriceNumber,
                    minPrice,
                    avgPrice,
                    productUrl
                };
            }

            const productGraphData: ProductGraphData[] = await fetchChartData(productUri);

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

            // Handle rate limit error (429) or retries exhausted
            if (retries === 0 || error?.response?.status === 429) {
                console.log('Retries exhausted or rate limit hit. Returning fallback data.');

                if (fallbackData) {
                    return fallbackData;
                } else {
                    throw new Error('Failed to track price and no fallback data available.');
                }
            }

            // Small delay before retrying
            await delay(100);
        }
    }

    return fallbackData;
}

// New function to batch fetch URLs with rate limiting
export async function fetchPricesFromUrls(urls: string[], fallbackDataList: any[] = []) {
    const batchSize = 5; // Number of URLs to process in one batch
    const delayBetweenBatches = 2000; // 2 seconds delay between batches

    const results: any[] = [];

    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        const batchFallbackData = fallbackDataList.slice(i, i + batchSize);

        // Fetch each batch concurrently
        const batchResults = await Promise.all(
            batch.map((url, index) => fetchPriceFromUrl(url, batchFallbackData[index]))
        );

        results.push(...batchResults);

        // Add delay between batches to avoid overwhelming the server
        if (i + batchSize < urls.length) {
            await delay(delayBetweenBatches);
        }
    }

    return results;
}