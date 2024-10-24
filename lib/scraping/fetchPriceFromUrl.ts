import axios from "axios";
import * as cheerio from 'cheerio';
import { extractName, extractPriceData } from "./functions/tweakers/extractData";
import { formatPrices } from "./functions/formatPrices";
import { Resend } from "resend";
import { ErrorTemplate } from "@/components/emails/errorEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function fetchPriceFromUrl(url: string, fallbackData: any = null) {
    if (!url) {
        await resend.emails.send({
            from: 'MODEX <errors@modexgaming.com',
            to: 'info@modexgaming.com',
            subject: 'URL is required',
            react: ErrorTemplate({
                error: 'URL is required',
                errorCode: 400,
            }),
        })
        throw new Error("URL is required.");
    }

    if (!url.startsWith("https://tweakers.net")) {
        return fallbackData;
    }

    let retries = 3;
    while (retries > 0) {
        console.log(`Attempting to fetch price data from ${url}, retries left: ${retries} at ${new Date().toISOString()}`);
        try {
            const fetchStartTime = Date.now();
            const { data } = await axios.get(url);
            const fetchEndTime = Date.now();
            console.log(`Data fetched successfully from ${url} in ${fetchEndTime - fetchStartTime} ms at ${new Date().toISOString()}`);

            const $ = cheerio.load(data);
            const { productPrice, productUrl } = extractPriceData($);
            if (!productPrice) {
                await resend.emails.send({
                    from: 'MODEX <errors@modexgaming.com',
                    to: 'info@modexgaming.com',
                    subject: 'Price not found',
                    react: ErrorTemplate({
                        error: 'Price not found',
                        errorCode: 400,
                    }),
                });
                throw new Error("Price not found.");
            }

            const productName = extractName($);
            const { minPriceNumber, avgPriceNumber, minPrice, avgPrice } = formatPrices(productPrice);

            return {
                productName,
                minPriceNumber,
                avgPriceNumber,
                minPrice,
                avgPrice,
                productUrl
            };
        } catch (error: any) {
            retries--;
            console.error('[TRACK_PRICE]', error);
            
            if (retries === 0 || error?.response?.status === 429) {
                if (fallbackData) {
                    fallbackData.error = true;
                    return fallbackData;
                } else {
                    await resend.emails.send({
                        from: 'MODEX <errors@modexgaming.com',
                        to: 'info@modexgaming.com',
                        subject: 'Failed to track price',
                        react: ErrorTemplate({
                            error: JSON.stringify(error),
                            errorCode: 400,
                        }),
                    });
                    throw new Error('Failed to track price and no fallback data available.');
                }
            }
            await new Promise(resolve => setTimeout(resolve, 1000 + (3 - retries) * 1000)); // Dynamic delay
        }
    }

    return fallbackData;
}
