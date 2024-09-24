import axios from "axios";
import * as cheerio from 'cheerio';
import { ProductGraphData } from "@/types";
import { fetchChartData } from "./fetchChartData";
import { extractName, extractPriceData, extractUri } from "./functions/extractData";
import { formatPrices } from "./functions/formatPrices";

export async function fetchPriceFromUrl(url: string) {
    try {
        const { data } = await axios.get(url);
        console.log(url)
        const $ = cheerio.load(data);

        const { productPrice, productUrl } = extractPriceData($);
        const productUri = extractUri($);
        const productName = extractName($);
        
        const productGraphData: ProductGraphData[] = await fetchChartData(productUri)
        const { minPriceNumber, avgPriceNumber, minPrice, avgPrice } = formatPrices(productPrice)
        
        return {
            productName,
            minPriceNumber,
            avgPriceNumber,
            minPrice,
            avgPrice,
            productUrl,
            productGraphData
        }
    } catch (error) {
        console.error('[TRACK_PRICE]', error);
        throw new Error('Failed to track price');
    }
}
