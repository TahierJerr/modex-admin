import axios from "axios";
import * as cheerio from 'cheerio';
import { ProductGraphData } from "@/types";
import { fetchChartData } from "./fetchChartData";
import { extractName, extractPriceData, extractUri } from "./functions/tweakers/extractData";
import { formatPrices } from "./functions/formatPrices";

export async function fetchPriceFromUrl(url: string, fallbackData: any = null) {
    if (!url.startsWith("https://tweakers.net")) {
        return fallbackData;
    }

    let retries = 3;
    while (retries > 0) {
        console.log(`Attempting to fetch price data from ${url}, retries left: ${retries}`);
        try {
            const fetchStartTime = Date.now();
            const { data } = await axios.get(url);
            const fetchEndTime = Date.now();
            console.log(`Data fetched successfully from ${url} in ${fetchEndTime - fetchStartTime} ms`);

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

            if (retries === 0 || error?.response?.status === 429) {
                if (fallbackData) {
                    fallbackData.error = true;
                    return fallbackData;
                } else {
                    throw new Error('Failed to track price and no fallback data available.');
                }
            }
            await new Promise(resolve => setTimeout(resolve, 1000 + (3 - retries) * 1000)); // Dynamic delay
        }
    }

    return fallbackData;
}
