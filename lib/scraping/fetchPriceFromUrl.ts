import axios from "axios";
import * as cheerio from 'cheerio';
import formatPrice from "../utils/formatPrice";
import priceToNumber from "../utils/priceToNumber";
import { ProductGraphData } from "@/types";
import { fetchChartData } from "./fetchChartData";

export async function fetchPriceFromUrl(url: string) {
    try {
        const { data } = await axios.get(url);
        console.log(url)
        const $ = cheerio.load(data);
        
        let productPrice = '';
        let productUrl = '';
        let productUri = '';
        
        const priceElement = $('td.shop-price').first();
        
        if (priceElement.length) {
            productPrice = priceElement.text().trim();
        }
        
        const linkElement = priceElement.find('a');
        
        if (!productPrice) {
            throw new Error("Price not found.");
        }
        
        if (linkElement.length) {
            productUrl = linkElement.attr('href') || '';
        }
        
        if (!productUrl) {
            throw new Error("Url not found.");
        }
        
        const uriElement = $('twk-price-history-graph#priceHistoryGraph').first();
        
        if (uriElement.length) {
            productUri = uriElement.attr('optionsrc') || '';
        }
        
        if (!productUri) {
            throw new Error("Uri not found.");
        }

        console.log("URI Element:", uriElement.html());
        
        const productGraphData: ProductGraphData[] = await fetchChartData(productUri)
        
        console.log(productGraphData)
        
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
            throw new Error("Unable to scrape product data");
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
        
        console.log(`Product Data: ${productData}`)
        console.log(`Product Graph Data: ${productGraphData}`)
        
        return {
            ...productData,
            productGraphData
        }
    } catch (error) {
        console.error('[TRACK_PRICE]', error);
        throw new Error('Failed to track price');
    }
}
